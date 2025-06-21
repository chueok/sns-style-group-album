import {
  GroupId,
  IGroupRepository,
  Nullable,
  TGroup,
  UserId,
  TGroupsPaginationParams,
  TGroupsPaginatedResult,
  TMember,
  Exception,
  Code,
  TMemberRole,
  TMemberStatus,
  TMemberProfile,
} from '@repo/be-core';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TypeormGroup } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { MemberMapper } from './mapper/member-mapper';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { v4, v6 } from 'uuid';
import { GroupMapper } from './mapper/group-mapper';
import { Transactional } from 'typeorm-transactional';
import { TypeormMember } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group-member.entity';

export class TypeormGroupRepository implements IGroupRepository {
  private typeormGroupRepository: Repository<TypeormGroup>;
  private typeormUserRepository: Repository<TypeormUser>;
  private typeormGroupMemberRepository: Repository<TypeormMember>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormGroupMemberRepository = dataSource.getRepository(TypeormMember);
    this.logger = logger || new Logger(TypeormGroupRepository.name);
  }

  async findUserProfile(userId: string): Promise<TMemberProfile> {
    const ormEntity = await this.typeormUserRepository.findOne({
      where: { id: userId as UserId, deletedDateTime: IsNull() },
      select: ['id', 'username', 'profileImageUrl'],
    });

    if (!ormEntity || !ormEntity.username) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'User not found',
      });
    }

    return {
      id: ormEntity.id,
      username: ormEntity.username,
      profileImageUrl: ormEntity.profileImageUrl || undefined,
    };
  }

  async isOwner(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.groupId = :groupId', { groupId })
      .andWhere('member.userId = :userId', { userId })
      .andWhere('member.role = :role', { role: 'owner' })
      .andWhere('member.status = :status', { status: 'approved' });

    const result = await queryBuilder.getCount();

    return result > 0;
  }

  async isApprovedMember(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.groupId = :groupId', { groupId })
      .andWhere('member.userId = :userId', { userId })
      .andWhere('member.status = :status', { status: 'approved' });

    const result = await queryBuilder.getCount();

    return result > 0;
  }

  @Transactional()
  async createGroup(payload: {
    groupName: string;
    ownerId: string;
    ownerUsername: string;
    ownerProfileImageUrl?: string;
  }): Promise<TGroup> {
    const newGroupId = v6() as GroupId;
    const newGroup = this.typeormGroupRepository.create({
      id: newGroupId,
      ownerId: payload.ownerId as UserId,
      name: payload.groupName,
      createdDateTime: new Date(),
      updatedDateTime: null,
      deletedDateTime: null,
    });

    const newGroupMember = this.typeormGroupMemberRepository.create({
      groupId: newGroupId,
      userId: payload.ownerId as UserId,
      username: payload.ownerUsername,
      role: 'owner',
      status: 'approved',
      profileImageUrl: payload.ownerProfileImageUrl,
      joinRequestDateTime: new Date(),
      joinDateTime: new Date(),
    });

    const result = await this.typeormGroupRepository.save(newGroup);
    await this.typeormGroupMemberRepository.save(newGroupMember);

    const domainEntity = GroupMapper.toDomainEntity(result);
    return domainEntity;
  }

  async findGroupBy(payload: {
    groupId?: string;
    invitationCode?: string;
  }): Promise<Nullable<TGroup>> {
    if (Object.keys(payload).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'At least one of groupId or invitationCode',
      });
    }

    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.deletedDateTime is null');

    if (payload.groupId) {
      queryBuilder.andWhere('group.id = :groupId', {
        groupId: payload.groupId,
      });
    }

    if (payload.invitationCode) {
      queryBuilder.andWhere('group.invitationCode = :invitationCode', {
        invitationCode: payload.invitationCode,
      });
    }

    const ormGroup = await queryBuilder.getOne();

    if (!ormGroup) {
      return null;
    }

    return GroupMapper.toDomainEntity(ormGroup);
  }

  async findGroupListBy(
    payload: { ownerId?: string; memberId?: string },
    pagination: TGroupsPaginationParams
  ): Promise<TGroupsPaginatedResult<TGroup>> {
    if (Object.keys(payload).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'At least one of ownerId or memberId',
      });
    }

    const { ownerId, memberId } = payload;
    const page = pagination.page ?? 1;

    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.deletedDateTime is null')
      .orderBy('group.createdDateTime', 'ASC');

    if (ownerId) {
      queryBuilder.andWhere('group.ownerId = :ownerId', { ownerId });
    }

    if (memberId) {
      queryBuilder.leftJoin('group.members', 'members');
      queryBuilder.andWhere('members.userId = :memberId', { memberId });
    }

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

  async deleteGroup(groupId: string): Promise<boolean> {
    const result = await this.typeormGroupRepository.update(groupId, {
      deletedDateTime: new Date(),
    });

    return result.affected === 1;
  }

  async isPendingMember(groupId: string, userId: string): Promise<boolean> {
    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.groupId = :groupId', { groupId })
      .andWhere('member.userId = :userId', { userId })
      .andWhere('member.status = :status', { status: 'pending' });
    const result = await queryBuilder.getCount();
    return result > 0;
  }

  async addMember({
    groupId,
    userId,
    role,
    status,
    profileImageUrl,
    username,
  }: {
    groupId: string;
    userId: string;
    role: TMemberRole;
    status: TMemberStatus;
    profileImageUrl?: string;
    username: string;
  }): Promise<TMember> {
    const newMember = this.typeormGroupMemberRepository.create({
      groupId,
      userId,
      role,
      status,
      profileImageUrl,
      username,
      joinRequestDateTime: new Date(),
    });

    const result = await this.typeormGroupMemberRepository.save(newMember);

    const domainMember = MemberMapper.toDomainEntity(result);

    return domainMember;
  }

  async findMembersBy(
    by: { groupId: string; userIdList?: string[]; status?: TMemberStatus },
    pagination: TGroupsPaginationParams
  ): Promise<TGroupsPaginatedResult<TMember>> {
    const { groupId, userIdList, status } = by;

    const page = pagination.page ?? 1;

    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.groupId = :groupId', { groupId });

    if (status) {
      queryBuilder.andWhere('member.status = :status', { status });
    }

    if (userIdList) {
      queryBuilder.andWhere('member.userId IN (:...userIdList)', {
        userIdList,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip((page - 1) * pagination.pageSize)
      .take(pagination.pageSize);

    const ormMembers = await queryBuilder.getMany();

    const domainMembers = MemberMapper.toDomainEntityList(ormMembers);

    return {
      items: domainMembers,
      total,
      page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async updateMember({
    groupId,
    userId,
    payload,
  }: {
    groupId: string;
    userId: string;
    payload: {
      username?: string;
      role?: 'owner' | 'member';
      status?: 'pending' | 'approved' | 'rejected' | 'droppedOut' | 'left';
      profileImageUrl?: string;
    };
  }): Promise<boolean> {
    if (Object.keys(payload).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage:
          'At least one of username, role, status, profileImageUrl',
      });
    }

    const updateObject: Partial<TypeormMember> = {
      updatedDateTime: new Date(),
    };
    if (payload.username) {
      updateObject.username = payload.username;
    }
    if (payload.role) {
      updateObject.role = payload.role;
    }
    if (payload.status) {
      updateObject.status = payload.status;
      if (payload.status === 'approved') {
        updateObject.joinDateTime = new Date();
      } else if (payload.status === 'droppedOut' || payload.status === 'left') {
        updateObject.leaveDateTime = new Date();
      }
    }
    if (payload.profileImageUrl) {
      updateObject.profileImageUrl = payload.profileImageUrl;
    }

    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .update()
      .where('member.groupId = :groupId', { groupId })
      .andWhere('member.userId = :userId', { userId })
      .set(updateObject);

    const result = await queryBuilder.execute();

    return result.affected !== undefined && result.affected > 0;
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
}
