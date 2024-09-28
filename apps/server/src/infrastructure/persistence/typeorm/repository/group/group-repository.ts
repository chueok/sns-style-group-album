import {
  Group,
  GroupId,
  IGroupRepository,
  Nullable,
  UserId,
} from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { GroupMapper } from "./mapper/group-mapper";
import { Logger, LoggerService, Optional } from "@nestjs/common";

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
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.members", "member")
      .where("group.id = :groupId", { groupId })
      .andWhere("group.deletedDateTime is null")
      .getOne();

    if (!ormGroup) {
      this.logger.error(`Group not found. id: ${groupId}`);
      return null;
    }
    const members = await ormGroup.members;
    const memberIdList = members.map((member) => member.id);
    const mapResult = await GroupMapper.toDomainEntity({
      elements: [{ group: ormGroup, members: memberIdList }],
    });

    mapResult.errors.forEach((error) => {
      this.logger.error(error);
    });

    return mapResult.results[0] || null;
  }

  async findGroupListByOwnerId(ownerId: UserId): Promise<Group[]> {
    const ormGroups = await this.typeormGroupRepository
      .createQueryBuilder("group")
      .where("group.ownerId = :ownerId", { ownerId })
      .andWhere("group.deletedDateTime is null")
      .getMany();

    const groupElements = await Promise.all(
      ormGroups.map(async (group) => {
        const members = await group.members;
        return {
          group,
          members: members.map((member) => member.id),
        };
      }),
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
      .createQueryBuilder("group")
      .innerJoinAndSelect("group.members", "member")
      .where("member.id = :userId", { userId })
      .andWhere("group.deletedDateTime is null")
      .getMany();

    const groupElements = await Promise.all(
      ormGroups.map(async (group) => {
        const members = await group.members;
        return {
          group,
          members: members.map((member) => member.id),
        };
      }),
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
