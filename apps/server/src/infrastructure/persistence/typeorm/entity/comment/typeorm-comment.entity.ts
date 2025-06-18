import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import { CommentId, ECommentCategory, Nullable, Optional } from '@repo/be-core';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TableAlias } from '../table-alias';
import { TypeormCommentUserTag } from '../commet-user-tag/typeorm-comment-user-tag.entity';
import { TypeormContent } from '../content/typeorm-content.entity';

@Entity(TableAlias.COMMENT)
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class TypeormComment {
  @PrimaryColumn({ type: 'text' })
  id!: CommentId;

  @Column({ type: 'text', enum: ECommentCategory, nullable: false })
  commentCategory!: ECommentCategory;

  @Column({ nullable: false })
  text!: string;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Nullable<Date>;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Nullable<Date>;

  /**
   * relations
   */
  @OneToMany(() => TypeormCommentUserTag, (tag) => tag.comment)
  tags!: Promise<TypeormCommentUserTag[]>;
  __tags__: Optional<TypeormCommentUserTag[]>;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  content!: Promise<TypeormContent>;
  __content__: Optional<TypeormContent>;
  @Column()
  contentId!: TypeormContent['id'];

  // for user comment
  @ManyToOne(() => TypeormUser, {
    nullable: true,
  })
  owner!: Promise<TypeormUser>;
  @Column({ type: 'text', nullable: true })
  ownerId!: Nullable<TypeormUser['id']>;

  // for system comment
  @Column({ type: 'text', nullable: true })
  subText!: Nullable<string>;
}

// // NOTE ChildEntity에서 정의된 모든 property 는 db상에서 nullable임
// @ChildEntity()
// export class TypeormUserComment extends TypeormComment {
//   override commentCategory = ECommentCategory.USER_COMMENT;

//   @ManyToOne(() => TypeormUser)
//   owner!: Promise<TypeormUser>;
//   @Column()
//   ownerId!: TypeormUser['id'];
// }

// @ChildEntity()
// export class TypeormSystemComment extends TypeormComment {
//   override commentCategory = ECommentCategory.SYSTEM_COMMENT;

//   @Column({ type: 'text' })
//   subText!: Nullable<string>;
// }

// //

// export function isTypeormUserComment(
//   comment: TypeormComment
// ): comment is TypeormUserComment {
//   return comment.commentCategory === ECommentCategory.USER_COMMENT;
// }

// export function isTypeormSystemComment(
//   comment: TypeormComment
// ): comment is TypeormSystemComment {
//   return comment.commentCategory === ECommentCategory.SYSTEM_COMMENT;
// }
