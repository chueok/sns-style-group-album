import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  OneToMany,
} from "typeorm";
import { GroupId, Nullable, Optional } from "@repo/be-core";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TableAlias } from "../table-alias";
import { TypeormUserGroupProfile } from "../user-group-profile/typeorm-user-group-profile.entity";

@Entity(TableAlias.GROUP)
export class TypeormGroup {
  @PrimaryColumn({ type: "text" })
  id!: GroupId;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;

  /**
   * relations
   */
  @ManyToMany(() => TypeormUser, (user) => user.groups)
  @JoinTable({ name: "GroupMembersRelation" })
  members!: Promise<TypeormUser[]>;
  __members__: Optional<TypeormUser[]>;

  @OneToMany(() => TypeormUserGroupProfile, (user) => user.group)
  memberProfiles!: Promise<TypeormUserGroupProfile[]>;
  __memberProfiles__: Optional<TypeormUserGroupProfile[]>;

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  __owner__: Optional<TypeormUser>;
  @Column()
  ownerId!: TypeormUser["id"];

  @ManyToMany(() => TypeormUser, (user) => user.invitedGroups)
  invitedUsers!: Promise<TypeormUser[]>;
  __invitedUsers__: Optional<TypeormUser[]>;
}

type TypeormGroupWithMembers = TypeormGroup & {
  __members__: NonNullable<TypeormGroup["__members__"]>;
};

type TypeormGroupWithMemberProfiles = TypeormGroup & {
  __memberProfiles__: NonNullable<TypeormGroup["__memberProfiles__"]>;
};

type TypeormGroupWithOwner = TypeormGroup & {
  __owner__: NonNullable<TypeormGroup["__owner__"]>;
};

type TypeormGroupWithInvitedUsers = TypeormGroup & {
  __invitedUsers__: NonNullable<TypeormGroup["__invitedUsers__"]>;
};

export type TypeormGroupWith = {
  members: TypeormGroupWithMembers;
  memberProfiles: TypeormGroupWithMemberProfiles;
  owner: TypeormGroupWithOwner;
  invitedUsers: TypeormGroupWithInvitedUsers;
};

export function isTypeormGroupWith<T extends keyof TypeormGroupWith>(
  group: TypeormGroup,
  key: T,
): group is TypeormGroupWith[T] {
  switch (key) {
    case "members":
      return !!group.__members__;
    case "memberProfiles":
      return !!group.__memberProfiles__;
    case "owner":
      return !!group.__owner__;
    case "invitedUsers":
      return !!group.__invitedUsers__;
    default:
      return false;
  }
}
