import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import {
  CommentId,
  ECommentCategory,
  ESystemCommentCategory,
  Nullable,
  Optional,
} from '@repo/be-core';
import { TableAlias } from '../table-alias';
import { TypeormCommentUserTag } from '../commet-user-tag/typeorm-comment-user-tag.entity';
import { TypeormContent } from '../content/typeorm-content.entity';
import { TypeormMember } from '../group/typeorm-member.entity';
import { TypeormGroup } from '../group/typeorm-group.entity';

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
    nullable: true,
    onDelete: 'CASCADE',
  })
  content!: Promise<TypeormContent>;
  __content__: Optional<TypeormContent>;
  @Column({ type: 'text', nullable: true })
  contentId!: Nullable<TypeormContent['id']>;

  // for user comment
  @ManyToOne(() => TypeormMember, {
    nullable: true,
  })
  owner!: Promise<TypeormMember>;
  @Column({ type: 'text', nullable: true })
  ownerId!: Nullable<TypeormMember['id']>;
  __owner__: Optional<TypeormMember>;

  @ManyToOne(() => TypeormGroup)
  group!: Promise<TypeormGroup>;
  @Column({ type: 'text' })
  groupId!: TypeormGroup['id'];
  __group__: Optional<TypeormGroup>;

  // for system comment
  @Column({ type: 'text', enum: ESystemCommentCategory, nullable: true })
  systemCommentCategory!: Nullable<ESystemCommentCategory>;

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
