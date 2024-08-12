import { IsInstance, IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CreateGroupEntityPayload } from "./type/create-group-entity-payload";
import { v4 } from "uuid";
import { GroupMember } from "./group-member";

export class Group extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id: string;

  @IsUUID()
  private _ownerId: string; //user id
  get ownerId(): string {
    return this._ownerId;
  }

  @IsString()
  private _name: string;
  get name(): string {
    return this._name;
  }

  @IsInstance(GroupMember, { each: true })
  private _members: Set<GroupMember>; // User ID의 집합으로 저장
  get members(): Set<GroupMember> {
    return this._members;
  }

  public async changeName(name: string): Promise<void> {
    this._name = name;
    return this.validate();
  }

  public async changeOwner(owner: GroupMember): Promise<boolean> {
    if (!this._members.has(owner)) {
      return false;
    }
    this._ownerId = owner.id;
    await this.validate();
    return true;
  }

  public async addMember(user: GroupMember): Promise<boolean> {
    if (this._members.has(user)) {
      return false;
    }
    this._members.add(user);
    await this.validate();
    return true;
  }

  public async removeMember(user: GroupMember): Promise<boolean> {
    const ret = this._members.delete(user);
    await this.validate();
    return ret;
  }

  public hasMember(user: GroupMember): boolean {
    return this._members.has(user);
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
      this._id = v4();
      this._members = new Set();

      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
    }
  }

  static async new(payload: CreateGroupEntityPayload<"all">) {
    const entity = new Group(payload);
    entity.validate();
    return entity;
  }
}
