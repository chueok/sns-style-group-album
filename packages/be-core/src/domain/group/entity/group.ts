import { IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CreateGroupEntityPayload } from "./type/create-group-entity-payload";
import { v4 } from "uuid";
import { GroupId } from "./type/group-id";
import { UserId } from "../../user/entity/type/user-id";
import _ from "lodash";

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
  private _members: UserId[]; // User ID의 집합으로 저장
  get members(): UserId[] {
    return this._members;
  }

  @IsUUID("all", { each: true })
  private _invitedUserList: UserId[];
  get invitedUserList(): UserId[] {
    return this._invitedUserList;
  }

  public async changeName(name: string): Promise<void> {
    this._name = name;
    this._updatedDateTime = new Date();
    return this.validate();
  }

  public async changeOwner(ownerId: UserId): Promise<boolean> {
    if (!this._members.includes(ownerId) || this._ownerId === ownerId) {
      return false;
    }
    this._ownerId = ownerId;
    this._updatedDateTime = new Date();
    await this.validate();
    return true;
  }

  public async inviteUsers(userList: UserId[]): Promise<void> {
    _.difference(userList, this._invitedUserList).forEach((userId) => {
      this._invitedUserList.push(userId);
    });
    await this.validate();
  }

  // TODO : boolean return 으로 바꾸어 db 부담 해소 할 것
  public async cancelInvitation(userList: UserId[]): Promise<void> {
    const toBeCanceledUserList = _.difference(userList, this._invitedUserList);
    _.pull(this._invitedUserList, ...toBeCanceledUserList);
    await this.validate();
  }

  public async acceptInvitation(userId: UserId): Promise<boolean> {
    const prevLength = this._invitedUserList.length;
    _.pull(this._invitedUserList, userId);
    const postLength = this._invitedUserList.length;
    if (prevLength === postLength) {
      return false;
    }

    this._members.push(userId);

    await this.validate();
    return true;
  }

  public async dropOutMembers(userIdList: UserId[]): Promise<void> {
    userIdList = userIdList.filter((userId) => userId !== this._ownerId);
    _.pull(this._members, ...userIdList);

    this._updatedDateTime = new Date();
    await this.validate();
  }

  public async deleteGroup(): Promise<boolean> {
    if (this.members.length !== 0) {
      return false;
    }

    this._deletedDateTime = new Date();
    await this.validate();
    return true;
  }

  constructor(payload: CreateGroupEntityPayload<"all">) {
    super();

    this._ownerId = payload.ownerId;
    this._name = payload.name;
    if ("id" in payload) {
      this._id = payload.id;
      this._members = payload.members;
      this._invitedUserList = payload.invitedUserList;

      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;
    } else {
      this._id = v4() as GroupId;
      this._members = [];
      this._invitedUserList = [];

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
