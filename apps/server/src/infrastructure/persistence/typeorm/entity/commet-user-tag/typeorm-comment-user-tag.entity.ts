import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { TableAlias } from "../table-alias";
import { TypeormComment } from "../comment/typeorm-comment.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { CommentId, UserId } from "@repo/be-core";

@Entity(TableAlias.COMMENT_USER_TAG)
export class TypeormCommentUserTag {
  @ManyToOne(() => TypeormComment, { onDelete: "NO ACTION" })
  comment!: Promise<TypeormComment>;

  @PrimaryColumn({ type: "text" })
  commentId!: CommentId;

  @OneToOne(() => TypeormUser, { onDelete: "NO ACTION" })
  user!: Promise<TypeormUser>;

  @PrimaryColumn({ type: "text" })
  userId!: UserId;

  @Column({ type: "text" })
  at!: string; // 숫자와 ,로 이루어진 문자열
}
