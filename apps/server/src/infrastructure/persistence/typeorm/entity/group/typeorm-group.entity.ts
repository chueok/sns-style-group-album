import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from "typeorm";
import { GroupId, Nullable, UserId } from "@repo/be-core";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TableAlias } from "../table-alias";

@Entity(TableAlias.GROUP)
export class TypeormGroup {
  @PrimaryColumn({ type: "text" })
  id!: GroupId;

  @Column({ nullable: false })
  name!: string;

  @ManyToMany(() => TypeormUser, (user) => user.groups)
  @JoinTable({ name: "GroupMembersRelation" })
  members!: Promise<TypeormUser[]>;

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  @Column()
  ownerId!: UserId;

  @ManyToMany(() => TypeormUser, (user) => user.invitedGroups)
  invitedUsers!: Promise<TypeormUser[]>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;
}
