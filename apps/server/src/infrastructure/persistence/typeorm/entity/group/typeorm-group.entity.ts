import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  OneToMany,
} from "typeorm";
import { GroupId, Nullable, Optional, UserId } from "@repo/be-core";
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
  ownerId!: UserId;

  @ManyToMany(() => TypeormUser, (user) => user.invitedGroups)
  invitedUsers!: Promise<TypeormUser[]>;
  __invitedUsers__: Optional<TypeormUser[]>;
}
