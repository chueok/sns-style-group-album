import { Group, IGroupRepository, Nullable } from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { GroupMapper } from "./mapper/group-mapper";

export class TypeormGroupRepository implements IGroupRepository {
  private typeormGroupRepository: Repository<TypeormGroup>;
  constructor(dataSource: DataSource) {
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);
  }

  async createGroup(group: Group): Promise<boolean> {
    const ormEntity = GroupMapper.toOrmEntity(group);

    return this.typeormGroupRepository
      .save(ormEntity)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  // NOTE : update 시점에는 nullable check가 안됨
  async updateGroup(group: Group): Promise<boolean> {
    return this.typeormGroupRepository
      .update(group.id, GroupMapper.toOrmEntity(group))
      .then(() => true)
      .catch(() => false);
  }

  async findGroupById(groupId: string): Promise<Nullable<Group>> {
    const ormGroup = await this.typeormGroupRepository.findOneBy({
      id: groupId,
    });

    if (!ormGroup) {
      return null;
    }
    return GroupMapper.toDomainEntity(ormGroup);
  }

  async findGroupListByOwnerId(ownerId: string): Promise<Group[]> {
    const ormGroups = await this.typeormGroupRepository
      .createQueryBuilder("group")
      .innerJoinAndSelect("group.owner", "owner")
      .where("owner.id = :ownerId", { ownerId })
      .getMany();
    return GroupMapper.toDomainEntity(ormGroups);
  }

  async findGroupListByUserId(userId: string): Promise<Group[]> {
    const ormGroups = await this.typeormGroupRepository
      .createQueryBuilder("group")
      .innerJoinAndSelect("group.members", "member")
      .where("member.id = :userId", { userId })
      .getMany();

    return GroupMapper.toDomainEntity(ormGroups);
  }
}
