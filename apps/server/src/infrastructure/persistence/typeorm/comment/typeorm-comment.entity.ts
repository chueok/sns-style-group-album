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
import { TypeormUser } from "../user/typeorm-user.entity";
import { TypeormContent } from "../content/typeorm-content.entity";
import { CommentTypeEnum, Nullable } from "@repo/be-core";

@Entity("Comment")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormComment {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  type!: CommentTypeEnum;

  @Column({ nullable: false })
  text!: string;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: "CASCADE",
  })
  content!: Promise<TypeormContent>;
  @Column({ nullable: false })
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
  override type = CommentTypeEnum.USER_COMMENT;

  @ManyToOne(() => TypeormUser)
  owner!: Promise<TypeormUser>;

  @Column({ type: "text" })
  ownerId!: string;

  @ManyToMany(() => TypeormUser)
  @JoinTable({ name: "CommentTagsRelation" })
  tags!: Promise<TypeormUser[]>;
}

@ChildEntity()
export class TypeormSystemComment extends TypeormComment {
  override type = CommentTypeEnum.SYSTEM_COMMENT;

  @Column({ type: "text" })
  subText!: Nullable<string>;
}
