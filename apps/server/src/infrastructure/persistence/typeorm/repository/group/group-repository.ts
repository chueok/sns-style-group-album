import {
  Group,
  GroupId,
  IGroupRepository,
  Nullable,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormGroup } from '../../entity/group/typeorm-group.entity';
import { GroupMapper } from './mapper/group-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';

export class TypeormGroupRepository implements IGroupRepository {
  private typeormGroupRepository: Repository<TypeormGroup>;

  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);
    this.logger = logger || new Logger(TypeormGroupRepository.name);
  }

  async createGroup(group: Group): Promise<boolean> {
    const ormEntity = GroupMapper.toOrmEntity([group]);

    return this.typeormGroupRepository
      .save(ormEntity)
      .then(() => {
        return true;
      })
      .catch((error) => {
        this.logger.error(error);
        return false;
      });
  }

  // NOTE join table 있을 경우 update 안됨. lazy loading을 처리하지 못하는 것으로 보임
  async updateGroup(group: Group): Promise<boolean> {
    const ormEntity = GroupMapper.toOrmEntity([group])[0];
    if (!ormEntity) return false;
    return this.typeormGroupRepository
      .save(ormEntity)
      .then(() => true)
      .catch((error) => {
        this.logger.error(error);
        return false;
      });
  }

  async findGroupById(groupId: GroupId): Promise<Nullable<Group>> {
    const ormGroup = await this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'members')
      .leftJoinAndSelect('group.invitedUsers', 'invitedUsers')
      .where('group.id = :groupId', { groupId })
      .andWhere('group.deletedDateTime is null')
      .getOne();

    if (!ormGroup) {
      this.logger.error(`Group not found. id: ${groupId}`);
      return null;
    }
    const members = await ormGroup.members;
    const memberIdList = members.map((member) => member.id);
    const invitedUsers = await ormGroup.invitedUsers;
    const invitedUserIdList = invitedUsers.map((invitedUser) => invitedUser.id);
    const mapResult = await GroupMapper.toDomainEntity({
      elements: [
        {
          group: ormGroup,
          members: memberIdList,
          invitedUsers: invitedUserIdList,
        },
      ],
    });

    mapResult.errors.forEach((error) => {
      this.logger.error(error);
    });

    return mapResult.results[0] || null;
  }

  async findGroupListByOwnerId(ownerId: UserId): Promise<Group[]> {
    const ormGroups = await this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'members')
      .leftJoinAndSelect('group.invitedUsers', 'invitedUsers')
      .where('group.ownerId = :ownerId', { ownerId })
      .andWhere('group.deletedDateTime is null')
      .getMany();

    const groupElements = await Promise.all(
      ormGroups.map(async (group) => {
        const members = await group.members;
        const invitedUsers = await group.invitedUsers;
        return {
          group,
          members: members.map((member) => member.id),
          invitedUsers: invitedUsers.map((invitedUser) => invitedUser.id),
        };
      })
    );

    const mapResult = await GroupMapper.toDomainEntity({
      elements: groupElements,
    });
    mapResult.errors.forEach((error) => {
      this.logger.error(error);
    });

    return mapResult.results;
  }

  async findGroupListByUserId(userId: UserId): Promise<Group[]> {
    const ormGroups = await this.typeormGroupRepository
      .createQueryBuilder('group')
      .innerJoinAndSelect('group.members', 'members')
      .leftJoinAndSelect('group.invitedUsers', 'invitedUsers')
      .where('members.id = :userId', { userId })
      .andWhere('group.deletedDateTime is null')
      .getMany();

    const groupElements = await Promise.all(
      ormGroups.map(async (group) => {
        const members = await group.members;
        const invitedUsers = await group.invitedUsers;
        return {
          group,
          members: members.map((member) => member.id),
          invitedUsers: invitedUsers.map((invitedUser) => invitedUser.id),
        };
      })
    );

    const mapResult = await GroupMapper.toDomainEntity({
      elements: groupElements,
    });
    mapResult.errors.forEach((error) => {
      this.logger.error(error);
    });

    return mapResult.results;
  }
}
