import {
  GroupId,
  IGroupRepository,
  Nullable,
  TGroup,
  UserId,
  TGroupsPaginationParams,
  TGroupsPaginatedResult,
  TGroupMember,
  TGroupJoinRequestUser,
  Exception,
  Code,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormGroup } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { JoinRequestUserMapper, MemberMapper } from './mapper/member-mapper';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { v4, v6 } from 'uuid';
import { GroupMapper } from './mapper/group-mapper';
import { TypeormJoinRequestUser } from '../infrastructure/persistence/typeorm/entity/group/typeorm-join-request-user.entity';
import { Transactional } from 'typeorm-transactional';

export class TypeormGroupRepository implements IGroupRepository {
  private typeormGroupRepository: Repository<TypeormGroup>;
  private typeormUserRepository: Repository<TypeormUser>;
  private typeormJoinRequestUserRepository: Repository<TypeormJoinRequestUser>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormJoinRequestUserRepository = dataSource.getRepository(
      TypeormJoinRequestUser
    );
    this.logger = logger || new Logger(TypeormGroupRepository.name);
  }

  @Transactional()
  async approveJoinRequestUser(
    groupId: string,
    userId: string
  ): Promise<boolean> {
    const result = await this.typeormJoinRequestUserRepository
      .createQueryBuilder('joinRequestUser')
      .update()
      .set({
        status: 'approved',
      })
      .where('joinRequestUser.groupId = :groupId', { groupId })
      .andWhere('joinRequestUser.userId = :userId', { userId })
      .andWhere('joinRequestUser.status = :status', { status: 'pending' })
      .execute();

    if (result.affected === 0) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to approve join request user',
      });
    }

    await this.typeormGroupRepository
      .createQueryBuilder('group')
      .relation('members')
      .of(groupId)
      .add(userId);

    return true;
  }

  async findGroupByInvitationCode(code: string): Promise<Nullable<TGroup>> {
    const ormGroup = await this.typeormGroupRepository.findOne({
      where: { invitationCode: code },
    });

    if (!ormGroup) {
      return null;
    }

    const domainGroup = GroupMapper.toDomainEntity(ormGroup);
    return domainGroup;
  }

  async findMembers(
    groupId: string,
    pagination: TGroupsPaginationParams
  ): Promise<TGroupsPaginatedResult<TGroupMember>> {
    const page = pagination.page ?? 1;

    const queryBuilder = this.typeormUserRepository
      .createQueryBuilder('user')
      .innerJoin('user.groups', 'groups', 'groups.id = :groupId', { groupId })
      .leftJoinAndSelect('user.userGroupProfiles', 'userGroupProfiles')
      .select(['user.id', 'user.username', 'user.profileImageUrl']);

    const total = await queryBuilder.getCount();

    if (pagination) {
      queryBuilder
        .skip((page - 1) * pagination.pageSize)
        .take(pagination.pageSize);
    }

    const ormMembers = await queryBuilder.getMany();

    const domainMembers = MemberMapper.toDomainEntityList(groupId, ormMembers);

    return {
      items: domainMembers,
      total,
      page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
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

  async refreshInvitationCode(groupId: string): Promise<string> {
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
      return this.refreshInvitationCode(groupId);
    }
  }

  async deleteInvitationCode(groupId: string): Promise<boolean> {
    const result = await this.typeormGroupRepository.update(groupId, {
      invitationCode: null,
    });

    return result.affected === 1;
  }

  async rejectJoinRequestUser(
    groupId: string,
    userId: string
  ): Promise<boolean> {
    const result = await this.typeormJoinRequestUserRepository
      .createQueryBuilder('joinRequestUser')
      .update()
      .set({
        status: 'rejected',
      })
      .where('joinRequestUser.groupId = :groupId', { groupId })
      .andWhere('joinRequestUser.userId = :userId', { userId })
      .andWhere('joinRequestUser.status = :status', { status: 'pending' })
      .execute();

    return !!result.affected && result.affected > 0;
  }

  async findJoinRequestUsers(
    groupId: string
  ): Promise<TGroupJoinRequestUser[]> {
    const members = await this.typeormUserRepository
      .createQueryBuilder('user')
      .leftJoin('user.joinRequestGroups', 'joinRequestGroups')
      .where('joinRequestGroups.groupId = :groupId', { groupId })
      .andWhere('joinRequestGroups.status = :status', { status: 'pending' })
      .select([
        'user.id',
        'user.username',
        'user.profileImageUrl',
        'joinRequestGroups.requestedDateTime',
      ])
      .getMany();

    const domainJoinRequestUsers = JoinRequestUserMapper.toDomainEntityList(
      groupId,
      members
    );
    return domainJoinRequestUsers;
  }

  async isJoinRequestUser(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoin('group.joinRequestUsers', 'joinRequestUsers')
      .where('group.id = :groupId', { groupId })
      .andWhere('joinRequestUsers.userId = :userId', { userId })
      .andWhere('joinRequestUsers.status = :status', { status: 'pending' });

    const result = await queryBuilder.getCount();
    return result > 0;
  }

  async addJoinRequestUsers(
    groupId: string,
    userIdList: string[]
  ): Promise<boolean> {
    // 이미 초대된 유저는 초대하지 않음
    const filteredUserIdList: string[] = [];
    const promiseList = userIdList.map(async (userId) => {
      const count = await this.typeormJoinRequestUserRepository.count({
        where: {
          groupId: groupId as GroupId,
          userId: userId as UserId,
          status: 'pending',
        },
      });

      if (count === 0) {
        filteredUserIdList.push(userId);
      }
    });
    await Promise.allSettled(promiseList);

    // filter 된 유저에 대해서만 초대
    const joinRequestUsers = filteredUserIdList.map((userId) => {
      return this.typeormJoinRequestUserRepository.create({
        groupId,
        userId,
        status: 'pending',
        requestedDateTime: new Date(),
      });
    });

    await this.typeormJoinRequestUserRepository.save(joinRequestUsers);

    return true;
  }

  async createGroup(payload: {
    ownerId: string;
    name: string;
  }): Promise<TGroup> {
    const ormEntity = this.typeormGroupRepository.create();
    ormEntity.id = v6() as GroupId;
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

  async findGroupsByOwnerId(payload: {
    ownerId: UserId;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>> {
    const { ownerId, pagination } = payload;
    const page = pagination.page ?? 1;

    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.ownerId = :ownerId', { ownerId })
      .andWhere('group.deletedDateTime is null');

    const total = await queryBuilder.getCount();

    if (pagination) {
      queryBuilder
        .skip((page - 1) * pagination.pageSize)
        .take(pagination.pageSize);
    }

    const ormGroups = await queryBuilder.getMany();

    const domainGroups = GroupMapper.toDomainEntityList(ormGroups);

    return {
      items: domainGroups,
      total,
      page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async findGroupsByMemberId(payload: {
    userId: UserId;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>> {
    const { userId, pagination } = payload;
    const page = pagination.page ?? 1;

    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoin('group.members', 'members')
      .where('members.id = :userId', { userId })
      .andWhere('group.deletedDateTime is null')
      .orderBy('group.createdDateTime', 'ASC');

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip((page - 1) * pagination.pageSize)
      .take(pagination.pageSize);

    const ormGroups = await queryBuilder.getMany();

    const domainGroups = GroupMapper.toDomainEntityList(ormGroups);

    return {
      items: domainGroups,
      total,
      page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }
}
