import { PrimaryColumn, Column, ManyToMany, Entity } from "typeorm";
import { TypeormGroup } from "../group/typeorm-group.entity";
import { Nullable } from "@repo/be-core";

// TODO USER를 DB에서 실제 삭제하지 않음??
@Entity("User")
export class TypeormUser {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  username!: string;

  @Column({ nullable: false })
  hashedPassword!: string;

  @Column({ type: "text", nullable: true })
  thumbnailRelativePath!: Nullable<string>;

  // NOTE nullable: false를 하더라도 효과 없음.
  // Join Table로 관리되기 때문인 것 같음.
  @ManyToMany(() => TypeormGroup, (group) => group.members, {
    onDelete: "CASCADE",
  })
  groups!: Promise<TypeormGroup[]>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;
}
