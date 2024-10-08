import {
  PrimaryColumn,
  Column,
  ManyToMany,
  Entity,
  OneToMany,
  JoinTable,
} from "typeorm";
import { TypeormGroup } from "../group/typeorm-group.entity";
import { Nullable, Optional, UserId } from "@repo/be-core";
import { TableAlias } from "../table-alias";
import { TypeormOauth } from "../oauth/typeorm-oauth.entity";
import { TypeormUserGroupProfile } from "../user-group-profile/typeorm-user-group-profile.entity";

@Entity(TableAlias.USER)
export class TypeormUser {
  @PrimaryColumn({ type: "text" })
  id!: UserId;

  @Column({ nullable: false })
  username!: string;

  @Column({ type: "text", nullable: true })
  email!: Nullable<string>;

  @Column({ type: "boolean", nullable: false })
  hasProfileImage!: boolean;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;

  /**
   * relations
   */
  @OneToMany(() => TypeormOauth, (oauth) => oauth.user)
  oauths!: Promise<TypeormOauth[]>;
  __oauths__: Optional<TypeormOauth[]>;

  // NOTE nullable: false를 하더라도 Join Table에서 관리 되므로 효과 없음.
  @ManyToMany(() => TypeormGroup, (group) => group.members)
  groups!: Promise<TypeormGroup[]>;
  __groups__: Optional<TypeormGroup[]>;

  @OneToMany(() => TypeormGroup, (group) => group.owner)
  ownGroups!: Promise<TypeormGroup[]>;
  __ownGroups__: Optional<TypeormGroup[]>;

  @OneToMany(() => TypeormUserGroupProfile, (profile) => profile.user)
  userGroupProfiles!: Promise<TypeormUserGroupProfile[]>;
  __userGroupProfiles__: Optional<TypeormUserGroupProfile[]>;

  @ManyToMany(() => TypeormGroup, (group) => group.invitedUsers, {
    cascade: false,
  })
  @JoinTable({ name: "GroupInvitedUsersRelation" })
  invitedGroups!: Promise<TypeormGroup[]>;
  __invitedGroups__: Optional<TypeormGroup[]>;
}
