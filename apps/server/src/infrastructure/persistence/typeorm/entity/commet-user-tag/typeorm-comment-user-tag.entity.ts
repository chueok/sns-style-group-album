import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { TableAlias } from "../table-alias";
import { TypeormComment } from "../comment/typeorm-comment.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { CommentId, Optional, UserId } from "@repo/be-core";

@Entity(TableAlias.COMMENT_USER_TAG)
export class TypeormCommentUserTag {
  @Column({ type: "text" })
  at!: string; // 숫자와 ,로 이루어진 문자열

  /**
   * relations
   */
  @ManyToOne(() => TypeormComment, { onDelete: "NO ACTION" })
  comment!: Promise<TypeormComment>;
  __comment__: Optional<TypeormComment>;
  @PrimaryColumn({ type: "text" })
  commentId!: CommentId;

  @OneToOne(() => TypeormUser, { onDelete: "NO ACTION" })
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @PrimaryColumn({ type: "text" })
  userId!: UserId;
}
