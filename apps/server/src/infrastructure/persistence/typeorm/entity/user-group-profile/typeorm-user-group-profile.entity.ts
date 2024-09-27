import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { TableAlias } from "../table-alias";
import { TypeormUser } from "../user/typeorm-user.entity";
import { GroupId, UserId } from "@repo/be-core";
import { TypeormGroup } from "../group/typeorm-group.entity";

@Entity(TableAlias.USER_GROUP_PROFILE)
export class TypeormUserGroupProfile {
  @ManyToOne(() => TypeormUser, (user) => user.userGroupProfiles, {
    onDelete: "CASCADE",
  })
  user!: TypeormUser;

  @PrimaryColumn({ type: "text" })
  userId!: UserId;

  @ManyToOne(() => TypeormGroup, { onDelete: "CASCADE" })
  group!: TypeormGroup;

  @PrimaryColumn({ type: "text" })
  groupId!: GroupId;

  @Column({ type: "text", nullable: false })
  nickname!: string;

  @Column({ type: "boolean", nullable: false })
  hasProfileImage!: boolean;
}
