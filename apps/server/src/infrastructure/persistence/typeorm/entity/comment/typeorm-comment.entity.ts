import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
  ChildEntity,
  OneToMany,
} from "typeorm";
import {
  CommentId,
  CommentTypeEnum,
  ContentId,
  Nullable,
  UserId,
} from "@repo/be-core";
import { TypeormContent } from "../content/typeorm-content.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TableAlias } from "../table-alias";
import { TypeormCommentUserTag } from "../commet-user-tag/typeorm-comment-user-tag.entity";

@Entity(TableAlias.COMMENT)
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormComment {
  @PrimaryColumn({ type: "text" })
  id!: CommentId;

  @Column({ type: "text", enum: CommentTypeEnum, nullable: false })
  commentType!: CommentTypeEnum;

  @Column({ nullable: false })
  text!: string;

  @OneToMany(() => TypeormCommentUserTag, (tag) => tag.comment)
  tags!: Promise<TypeormCommentUserTag[]>;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: "CASCADE",
  })
  content!: Promise<TypeormContent>;
  @Column()
  contentId!: ContentId;

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
  ownerId!: UserId;
}

@ChildEntity()
export class TypeormSystemComment extends TypeormComment {
  override commentType = CommentTypeEnum.SYSTEM_COMMENT;

  @Column({ type: "text" })
  subText!: Nullable<string>;
}

//

export function isTypeormUserComment(
  comment: TypeormComment,
): comment is TypeormUserComment {
  return comment.commentType === CommentTypeEnum.USER_COMMENT;
}

export function isTypeormSystemComment(
  comment: TypeormComment,
): comment is TypeormSystemComment {
  return comment.commentType === CommentTypeEnum.SYSTEM_COMMENT;
}
