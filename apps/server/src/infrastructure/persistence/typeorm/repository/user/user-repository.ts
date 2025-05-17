import { IUserRepository, Nullable, User, UserId } from '@repo/be-core';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import {
  isTypeormUserWith,
  TypeormUser,
} from '../../entity/user/typeorm-user.entity';
import { UserMapper } from './mapper/user-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { TypeormUserGroupProfile } from '../../entity/user-group-profile/typeorm-user-group-profile.entity';
import { isTypeormGroupWith } from '../../entity/group/typeorm-group.entity';

// TODO : 전체 Repository Promise 최적화 필요
export class TypeormUserRepository implements IUserRepository {
  private readonly userQueryAlias = 'user';

  private typeormUserRepository: Repository<TypeormUser>;
  private typeormUserGroupProfileRepository: Repository<TypeormUserGroupProfile>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormUserGroupProfileRepository = dataSource.getRepository(
      TypeormUserGroupProfile
    );

    this.logger = logger || new Logger(TypeormUserRepository.name);
  }

  async createUser(user: User): Promise<boolean> {
    const mappedEntity = UserMapper.toOrmEntity([user]).at(0);
    if (!mappedEntity) return false;
    const { user: ormUser, userGroupProfile } = mappedEntity;

    const result = await this.typeormUserRepository
      .save(ormUser)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });

    if (userGroupProfile.length === 0) {
      return result;
    }
    const groupProfileResult = await this.typeormUserGroupProfileRepository
      .save(userGroupProfile)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
    return result && groupProfileResult;
  }

  async updateUser(user: User): Promise<boolean> {
    const mappedEntity = UserMapper.toOrmEntity([user]).at(0);
    if (!mappedEntity) return false;
    const { user: ormUser, userGroupProfile } = mappedEntity;

    const result = await this.typeormUserRepository
      .save(ormUser)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });

    if (userGroupProfile.length === 0) {
      return result;
    }
    const groupProfileResult = await this.typeormUserGroupProfileRepository
      .save(userGroupProfile)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
    return result && groupProfileResult;
  }

  async findUserById(id: UserId): Promise<Nullable<User>> {
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'groups')
      .leftJoinAndSelect('user.ownGroups', 'ownGroup')
      .leftJoinAndSelect('user.userGroupProfiles', 'userGroupProfiles')
      .leftJoinAndSelect('user.invitedGroups', 'invitedGroups')
      .leftJoinAndSelect('invitedGroups.memberProfiles', 'memberProfiles')
      .leftJoinAndSelect('invitedGroups.owner', 'owner')
      .where('user.id = :id', { id })
      .andWhere('user.deletedDateTime is null')
      .getOne();
    if (!ormUser) {
      return null;
    }

    if (
      !isTypeormUserWith(ormUser, 'groups') ||
      !isTypeormUserWith(ormUser, 'ownGroups') ||
      !isTypeormUserWith(ormUser, 'userGroupProfiles') ||
      !isTypeormUserWith(ormUser, 'invitedGroups')
    ) {
      return null;
    }

    const groups = ormUser.__groups__;
    const ownGroups = ormUser.__ownGroups__;
    const userGroupProfile = ormUser.__userGroupProfiles__;
    const invitedGroups = ormUser.__invitedGroups__;

    const invitedGroupsElements = invitedGroups
      .map((invitedGroup) => {
        if (
          !isTypeormGroupWith(invitedGroup, 'memberProfiles') ||
          !isTypeormGroupWith(invitedGroup, 'owner')
        ) {
          return null;
        }
        const memberProfiles = invitedGroup.__memberProfiles__;
        const owner = invitedGroup.__owner__;

        return { group: invitedGroup, memberProfiles, owner };
      })
      .filter((element) => element !== null);

    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [
        {
          user: ormUser,
          groups,
          ownGroups,
          userGroupProfiles: userGroupProfile,
          invitedGroupsElements,
        },
      ],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results[0] || null;
  }

  async findUserListByGroupId(groupId: string): Promise<User[]> {
    const ormUsers = await this.typeormUserRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.groups', 'groups')
      .leftJoinAndSelect('user.ownGroups', 'ownGroup')
      .leftJoinAndSelect('user.userGroupProfiles', 'userGroupProfiles')
      .leftJoinAndSelect('user.invitedGroups', 'invitedGroups')
      .leftJoinAndSelect('invitedGroups.memberProfiles', 'memberProfiles')
      .leftJoinAndSelect('invitedGroups.owner', 'owner')
      .where('groups.id = :groupId', { groupId })
      .andWhere('user.deletedDateTime is null')
      .getMany();

    const elements = await Promise.all(
      ormUsers.map(async (ormUser) => {
        const invitedGroups = await ormUser.invitedGroups;
        const invitedGroupsElements = await Promise.all(
          invitedGroups.map(async (invitedGroup) => {
            const memberProfiles = await invitedGroup.memberProfiles;
            const owner = await invitedGroup.owner;
            return { group: invitedGroup, memberProfiles, owner };
          })
        );
        return {
          user: ormUser,
          groups: await ormUser.groups,
          ownGroups: await ormUser.ownGroups,
          userGroupProfiles: await ormUser.userGroupProfiles,
          invitedGroupsElements,
        };
      })
    );

    const { results, errors } = await UserMapper.toDomainEntity({ elements });
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results;
  }

  private extendQueryWithNotDeleted(
    queryBuilder: SelectQueryBuilder<TypeormUser>
  ): SelectQueryBuilder<TypeormUser> {
    return queryBuilder.andWhere(
      `${this.userQueryAlias}.deletedDateTime is null`
    );
  }
}
