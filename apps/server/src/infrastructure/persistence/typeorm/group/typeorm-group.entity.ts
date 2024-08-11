import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { TypeormUser } from "../user/typeorm-user.entity";
import { Nullable } from "@repo/be-core";

@Entity("Group")
export class TypeormGroup {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @ManyToMany(() => TypeormUser, (user) => user.groups, { onDelete: "CASCADE" })
  @JoinTable({ name: "GroupMembersRelation" })
  members!: Promise<TypeormUser[]>;

  @ManyToOne(() => TypeormUser, { nullable: true, onDelete: "SET NULL" })
  owner!: Promise<Nullable<TypeormUser>>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;
}
