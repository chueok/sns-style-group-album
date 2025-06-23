import {
  GroupId,
  IGroupRepository,
  Nullable,
  TGroup,
  UserId,
  TGroupPaginationParams,
  TGroupPaginatedResult,
  TMember,
  Exception,
  Code,
  TMemberRole,
  TMemberStatus,
  TUserProfile,
  TMemberPaginatedResult,
  TMemberPaginationParams,
} from '@repo/be-core';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TypeormGroup } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { MemberMapper } from './mapper/member-mapper';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { v4, v6 } from 'uuid';
import { GroupMapper } from './mapper/group-mapper';
import { TypeormMember } from '../infrastructure/persistence/typeorm/entity/group/typeorm-member.entity';

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

  async findUserProfile(userId: string): Promise<TUserProfile> {
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
      userId: ormEntity.id,
      username: ormEntity.username,
      profileImageUrl: ormEntity.profileImageUrl || undefined,
    };
  }

  async createGroup(payload: { groupName: string }): Promise<TGroup> {
    const newGroupId = v6() as GroupId;
    const newGroup = this.typeormGroupRepository.create({
      id: newGroupId,
      name: payload.groupName,
      createdDateTime: new Date(),
      updatedDateTime: null,
      deletedDateTime: null,
    });

    const newGroupEntity = await this.typeormGroupRepository.save(newGroup);

    const domainEntity = GroupMapper.toDomainEntity(newGroupEntity);
    return domainEntity;
  }

  async findGroupBy(
    payload:
      | {
          groupId: string;
        }
      | {
          invitationCode: string;
        }
  ): Promise<Nullable<TGroup>> {
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.deletedDateTime is null');

    if ('groupId' in payload) {
      queryBuilder.andWhere('group.id = :groupId', {
        groupId: payload.groupId,
      });
    }

    if ('invitationCode' in payload) {
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
    payload: {
      userId: string;
      role?: TMemberRole;
      status?: 'approved' | 'pending';
    },
    pagination: TGroupPaginationParams
  ): Promise<TGroupPaginatedResult> {
    if (Object.keys(payload).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'At least one of role or userId',
      });
    }

    const { role, userId, status } = payload;
    const page = pagination.page ?? 1;

    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .where('group.deletedDateTime is null')
      .orderBy('group.createdDateTime', 'ASC')
      .leftJoin('group.members', 'members')
      .andWhere('members.userId = :userId', { userId: userId });

    if (role) {
      queryBuilder.andWhere('members.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('members.status = :status', { status });
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
      name?: string;
    }
  ): Promise<TGroup> {
    if (Object.keys(payload).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'At least one of update payload',
      });
    }

    const updateObject: Partial<TypeormGroup> = {};
    if (payload.name) {
      updateObject.name = payload.name;
    }

    const updateResult = await this.typeormGroupRepository
      .createQueryBuilder()
      .update()
      .where('id = :groupId', { groupId })
      .andWhere('deletedDateTime is null')
      .set(updateObject)
      .execute();

    if (updateResult.affected === 0) {
      throw new Error('Update group failed');
    }

    const ormEntity = await this.typeormGroupRepository.findOne({
      where: { id: groupId as GroupId, deletedDateTime: IsNull() },
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
      id: v6(),
      groupId,
      userId,
      role,
      status,
      profileImageUrl,
      username,
      joinRequestDateTime: new Date(),
      joinDateTime: new Date(),
    });

    const result = await this.typeormGroupMemberRepository.save(newMember);

    const domainMember = MemberMapper.toDomainEntity(result);

    return domainMember;
  }

  async findMemberListBy(
    by: { groupId: string; status?: TMemberStatus } | { memberIds: string[] },
    pagination: TMemberPaginationParams
  ): Promise<TMemberPaginatedResult> {
    const page = pagination.page ?? 1;

    const queryBuilder =
      this.typeormGroupMemberRepository.createQueryBuilder('member');

    if ('groupId' in by) {
      const { groupId, status } = by;
      queryBuilder.andWhere('member.groupId = :groupId', { groupId });
      if (status) {
        queryBuilder.andWhere('member.status = :status', { status });
      }
    }

    if ('memberIds' in by) {
      const { memberIds } = by;
      queryBuilder.andWhere('member.id IN (:...memberIds)', {
        memberIds,
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

  async findMemberBy(
    by:
      | {
          memberId: string;
        }
      | { groupId: string; userId: string; status: 'approved' | 'pending' }
  ): Promise<Nullable<TMember>> {
    if (Object.keys(by).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'At least one of memberId or userId',
      });
    }

    const queryBuilder =
      this.typeormGroupMemberRepository.createQueryBuilder('member');

    if ('memberId' in by) {
      const { memberId } = by;
      queryBuilder.where('member.id = :memberId', { memberId });
    } else if ('groupId' in by) {
      const { groupId, userId, status } = by;
      queryBuilder
        .where('member.status = :status', { status })
        .andWhere('member.groupId = :groupId', { groupId })
        .andWhere('member.userId = :userId', { userId });
    }

    const result = await queryBuilder.getOne();

    return result ? MemberMapper.toDomainEntity(result) : null;
  }

  async findOwnerBy(
    by: { groupId: string } | { memberId: string }
  ): Promise<TMember> {
    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.role = :role', { role: 'owner' })
      .andWhere('member.status = :status', { status: 'approved' });

    if ('memberId' in by) {
      const { memberId } = by;
      const member = await this.typeormGroupMemberRepository.findOne({
        where: {
          id: memberId,
        },
      });
      if (!member) {
        throw Exception.new({
          code: Code.ENTITY_NOT_FOUND_ERROR,
          overrideMessage: 'Member not found',
        });
      }
      queryBuilder.andWhere('member.groupId = :groupId', {
        groupId: member.groupId,
      });
    }

    if ('groupId' in by) {
      const { groupId } = by;
      queryBuilder.andWhere('member.groupId = :groupId', { groupId });
    }

    const result = await queryBuilder.getOne();
    if (!result) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Owner not found',
      });
    }

    return MemberMapper.toDomainEntity(result);
  }

  async updateMember({
    memberId,
    payload,
  }: {
    memberId: string;
    payload: {
      username?: string;
      role?: TMemberRole;
      status?: TMemberStatus;
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
      .where('member.id = :memberId', { memberId })
      .set(updateObject);

    const result = await queryBuilder.execute();

    return result.affected !== undefined && result.affected > 0;
  }

  async findInvitationCodeBy(groupId: string): Promise<Nullable<string>> {
    const ormGroup = await this.typeormGroupRepository.findOne({
      where: { id: groupId as GroupId, deletedDateTime: IsNull() },
      select: ['invitationCode'],
    });

    return ormGroup?.invitationCode || null;
  }

  async saveInvitationCode(payload: {
    groupId: string;
    invitationCode: string;
  }): Promise<void> {
    const result = await this.typeormGroupRepository
      .createQueryBuilder()
      .update()
      .where('id = :groupId', { groupId: payload.groupId })
      .andWhere('deletedDateTime is null')
      .set({ invitationCode: payload.invitationCode })
      .execute();

    if (result.affected === 0) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to save invitation code',
      });
    }
  }

  async deleteInvitationCode(groupId: string): Promise<boolean> {
    const result = await this.typeormGroupRepository
      .createQueryBuilder()
      .update()
      .where('id = :groupId', { groupId })
      .set({ invitationCode: null })
      .execute();

    return result.affected !== undefined && result.affected > 0;
  }
}
