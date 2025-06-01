import {
  GroupId,
  IGroupRepository,
  Nullable,
  TGroup,
  UserId,
  TPaginationParams,
  TPaginatedResult,
  TGroupMember,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormGroup } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { MemberMapper } from './mapper/member-mapper';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { v4 } from 'uuid';
import { GroupMapper } from './mapper/group-mapper';

export class TypeormGroupRepository implements IGroupRepository {
  private typeormGroupRepository: Repository<TypeormGroup>;
  private typeormUserRepository: Repository<TypeormUser>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.logger = logger || new Logger(TypeormGroupRepository.name);
  }

  async findMembers(
    groupId: string,
    pagination?: TPaginationParams
  ): Promise<TPaginatedResult<TGroupMember>> {
    const queryBuilder = this.typeormUserRepository
      .createQueryBuilder('user')
      .innerJoin('user.groups', 'groups', 'groups.id = :groupId', { groupId })
      .leftJoinAndSelect('user.userGroupProfiles', 'userGroupProfiles')
      .select(['user.id', 'user.username', 'user.profileImageUrl']);

    const total = await queryBuilder.getCount();

    if (pagination) {
      queryBuilder
        .skip((pagination.page - 1) * pagination.pageSize)
        .take(pagination.pageSize);
    }

    const ormMembers = await queryBuilder.getMany();

    const domainMembers = MemberMapper.toDomainEntityList(groupId, ormMembers);

    return {
      items: domainMembers,
      total,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || total,
      totalPages: pagination ? Math.ceil(total / pagination.pageSize) : 1,
    };
  }

  async addMembers(groupId: string, memberIdList: string[]): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .relation('members')
      .of(groupId);

    try {
      await queryBuilder.add(memberIdList);
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteMembers(
    groupId: string,
    memberIdList: string[]
  ): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .relation('members')
      .of(groupId);

    try {
      await queryBuilder.remove(memberIdList);
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteGroup(groupId: string): Promise<boolean> {
    const result = await this.typeormGroupRepository.update(groupId, {
      deletedDateTime: new Date(),
    });

    return result.affected === 1;
  }

  async isOwner(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.id = :groupId', { groupId })
      .andWhere('group.ownerId = :userId', { userId });

    const result = await queryBuilder.getCount();

    return result > 0;
  }
  async isMember(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoin('group.members', 'members')
      .where('group.id = :groupId', { groupId })
      .andWhere('members.id = :userId', { userId });

    const result = await queryBuilder.getCount();

    return result > 0;
  }

  async generateInvitationCode(groupId: string): Promise<string> {
    // UUID v4를 생성하고 하이픈을 제거한 후 앞 8자리만 사용
    const randomCode = v4().replace(/-/g, '').slice(0, 8);

    // 그룹 엔티티에 초대 코드 저장
    await this.typeormGroupRepository.update(groupId, {
      invitationCode: randomCode,
    });

    return randomCode;
  }

  async getInvitationCode(groupId: string): Promise<string> {
    const ormGroup = await this.typeormGroupRepository.findOne({
      where: { id: groupId as GroupId },
      select: ['invitationCode'],
    });

    if (ormGroup?.invitationCode) {
      return ormGroup.invitationCode;
    } else {
      return this.generateInvitationCode(groupId);
    }
  }

  async deleteInvitationCode(groupId: string): Promise<boolean> {
    const result = await this.typeormGroupRepository.update(groupId, {
      invitationCode: null,
    });

    return result.affected === 1;
  }

  async deleteJoinRequestUsers(
    groupId: string,
    userIdList: string[]
  ): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .relation('joinRequestUsers')
      .of(groupId);

    try {
      await queryBuilder.remove(userIdList);
      return true;
    } catch (error) {
      return false;
    }
  }

  async findJoinRequestUserList(groupId: string): Promise<TGroupMember[]> {
    const members = await this.typeormUserRepository
      .createQueryBuilder('user')
      .leftJoin('user.joinRequestGroups', 'joinRequestGroups')
      .where('joinRequestGroups.id = :groupId', { groupId })
      .select(['user.id', 'user.username', 'user.profileImageUrl'])
      .getMany();

    return MemberMapper.toDomainEntityList(groupId, members);
  }

  async isJoinRequestUser(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoin('group.joinRequestUsers', 'joinRequestUsers')
      .where('group.id = :groupId', { groupId })
      .andWhere('joinRequestUsers.id = :userId', { userId });

    const result = await queryBuilder.getCount();
    return result > 0;
  }

  async addJoinRequestUsers(
    code: string,
    userIdList: string[]
  ): Promise<boolean> {
    const group = await this.typeormGroupRepository.findOne({
      where: { invitationCode: code },
      select: ['id'],
    });
    if (!group) {
      throw new Error('Group not found');
    }

    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .relation('joinRequestUsers')
      .of(group.id);

    try {
      await queryBuilder.add(userIdList);
      return true;
    } catch (error) {
      return false;
    }
  }

  async createGroup(payload: {
    ownerId: string;
    name: string;
  }): Promise<TGroup> {
    const ormEntity = this.typeormGroupRepository.create();
    ormEntity.id = v4() as GroupId;
    ormEntity.ownerId = payload.ownerId as UserId;
    ormEntity.name = payload.name;

    ormEntity.members = Promise.resolve([
      { id: payload.ownerId } as TypeormUser,
    ]);

    ormEntity.createdDateTime = new Date();
    ormEntity.updatedDateTime = null;
    ormEntity.deletedDateTime = null;

    const result = await this.typeormGroupRepository.save(ormEntity);

    const domainEntity = GroupMapper.toDomainEntity(result);
    return domainEntity;
  }

  async updateGroup(
    groupId: string,
    payload: {
      ownerId?: string;
      name?: string;
    }
  ): Promise<TGroup> {
    const updateObject: Partial<TypeormGroup> = {};
    if (payload.ownerId) {
      updateObject.ownerId = payload.ownerId as UserId;
    }
    if (payload.name) {
      updateObject.name = payload.name;
    }

    const updateResult = await this.typeormGroupRepository.update(
      groupId,
      updateObject
    );
    if (updateResult.affected === 0) {
      throw new Error('Update group failed');
    }

    const ormEntity = await this.typeormGroupRepository.findOne({
      where: { id: groupId as GroupId },
    });
    if (!ormEntity) {
      throw new Error('Group not found');
    }

    return GroupMapper.toDomainEntity(ormEntity);
  }

  async findGroupById(groupId: GroupId): Promise<Nullable<TGroup>> {
    const ormGroup = await this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.id = :groupId', { groupId })
      .andWhere('group.deletedDateTime is null')
      .getOne();

    if (!ormGroup) {
      this.logger.error(`Group not found. id: ${groupId}`);
      return null;
    }
    const domainGroup = GroupMapper.toDomainEntity(ormGroup);

    return domainGroup;
  }

  async findGroupsByOwnerId(
    ownerId: UserId,
    pagination?: TPaginationParams
  ): Promise<TPaginatedResult<TGroup>> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.ownerId = :ownerId', { ownerId })
      .andWhere('group.deletedDateTime is null');

    const total = await queryBuilder.getCount();

    if (pagination) {
      queryBuilder
        .skip((pagination.page - 1) * pagination.pageSize)
        .take(pagination.pageSize);
    }

    const ormGroups = await queryBuilder.getMany();

    const domainGroups = GroupMapper.toDomainEntityList(ormGroups);

    return {
      items: domainGroups,
      total,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || total,
      totalPages: pagination ? Math.ceil(total / pagination.pageSize) : 1,
    };
  }

  async findGroupsByUserId(
    userId: UserId,
    pagination?: TPaginationParams
  ): Promise<TPaginatedResult<TGroup>> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('members.id = :userId', { userId })
      .andWhere('group.deletedDateTime is null');

    const total = await queryBuilder.getCount();

    if (pagination) {
      queryBuilder
        .skip((pagination.page - 1) * pagination.pageSize)
        .take(pagination.pageSize);
    }

    const ormGroups = await queryBuilder.getMany();

    const domainGroups = GroupMapper.toDomainEntityList(ormGroups);

    return {
      items: domainGroups,
      total,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || total,
      totalPages: pagination ? Math.ceil(total / pagination.pageSize) : 1,
    };
  }
}
