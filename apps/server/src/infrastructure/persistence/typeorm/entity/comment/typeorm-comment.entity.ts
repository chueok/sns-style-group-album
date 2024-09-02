import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
  ChildEntity,
} from "typeorm";
import { CommentTypeEnum, Nullable } from "@repo/be-core";
import { TypeormContent } from "../content/typeorm-content.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TableAlias } from "../table-alias";

@Entity(TableAlias.COMMENT)
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormComment {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  commentType!: CommentTypeEnum;

  @Column({ nullable: false })
  text!: string;

  @ManyToMany(() => TypeormUser)
  @JoinTable({ name: "CommentTagsRelation" })
  tags!: Promise<TypeormUser[]>;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: "CASCADE",
  })
  content!: Promise<TypeormContent>;
  @Column()
  contentId!: string;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;
  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;
}

// NOTE ChildEntity에서 정의된 모든 property 는 db상에서 nullable임
@ChildEntity()
export class TypeormUserComment extends TypeormComment {
  override commentType = CommentTypeEnum.USER_COMMENT;

  @ManyToOne(() => TypeormUser)
  owner!: Promise<TypeormUser>;
  @Column()
  ownerId!: string;
}

@ChildEntity()
export class TypeormSystemComment extends TypeormComment {
  override commentType = CommentTypeEnum.SYSTEM_COMMENT;

  @Column({ type: "text" })
  subText!: Nullable<string>;
}
