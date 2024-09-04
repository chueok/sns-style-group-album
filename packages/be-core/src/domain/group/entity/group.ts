import { IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CreateGroupEntityPayload } from "./type/create-group-entity-payload";
import { v4 } from "uuid";
import { GroupId } from "./type/group-id";
import { UserId } from "../../user/entity/type/user-id";

export class Group extends EntityWithCUDTime<GroupId> {
  @IsUUID()
  protected override _id: GroupId;

  @IsUUID()
  private _ownerId: UserId; //user id
  get ownerId(): UserId {
    return this._ownerId;
  }

  @IsString()
  private _name: string;
  get name(): string {
    return this._name;
  }

  @IsUUID("all", { each: true })
  private _members: Set<UserId>; // User ID의 집합으로 저장
  get members(): UserId[] {
    return Array.from(this._members);
  }

  public async changeName(name: string): Promise<void> {
    this._name = name;
    return this.validate();
  }

  public async changeOwner(ownerId: UserId): Promise<boolean> {
    if (!this._members.has(ownerId)) {
      return false;
    }
    this._ownerId = ownerId;
    await this.validate();
    return true;
  }

  public async addMember(userId: UserId): Promise<boolean> {
    if (this._members.has(userId)) {
      return false;
    }
    this._members.add(userId);
    await this.validate();
    return true;
  }

  public async removeMember(userId: UserId): Promise<boolean> {
    const ret = this._members.delete(userId);
    await this.validate();
    return ret;
  }

  public hasMember(userId: UserId): boolean {
    return this._members.has(userId);
  }

  constructor(payload: CreateGroupEntityPayload<"all">) {
    super();

    this._ownerId = payload.ownerId;
    this._name = payload.name;
    if ("id" in payload) {
      this._id = payload.id;
      this._members = new Set(payload.members);

      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;
    } else {
      this._id = v4() as GroupId;
      this._members = new Set();

      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
    }
  }

  static async new(payload: CreateGroupEntityPayload<"all">) {
    const entity = new Group(payload);
    await entity.validate();
    return entity;
  }
}
