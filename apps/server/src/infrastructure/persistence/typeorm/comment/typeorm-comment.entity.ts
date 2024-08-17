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
  })
  content!: Promise<TypeormContent>;
  @Column({ nullable: false })
  contentId!: string;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
  @Column({ type: "datetime", nullable: true })
  updatedDateTime?: Date;
  @Column({ type: "datetime", nullable: true })
  deletedDateTime?: Date;
}

@ChildEntity()
export class TypeormUserComment extends TypeormComment {
  override type = CommentTypeEnum.USER_COMMENT;

  // user가 삭제 되었을 경우 Comment의 owner가 null 일 수 있음
  // Promise Type이 lazy loading인 것을 알려주고,
  // Promise가 아니면 eager임을 알기에 생략
  @ManyToOne(() => TypeormUser, { nullable: true, onDelete: "SET NULL" })
  owner!: Promise<Nullable<TypeormUser>>;

  @Column({ type: "text", nullable: true })
  ownerId!: Nullable<string>;

  @ManyToMany(() => TypeormUser, { nullable: false })
  @JoinTable({ name: "CommentTagsRelation" })
  tags!: Promise<TypeormUser[]>;
}

@ChildEntity()
export class TypeormSystemComment extends TypeormComment {
  override type = CommentTypeEnum.SYSTEM_COMMENT;

  @Column({ type: "text", nullable: true })
  subText!: Nullable<string>;
}
