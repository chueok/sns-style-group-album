import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { TypeormComment } from '../comment/typeorm-comment.entity';
import { Optional } from '@repo/be-core';
import { TypeormMember } from '../group/typeorm-member.entity';

@Entity(TableAlias.COMMENT_USER_TAG)
export class TypeormCommentUserTag {
  @Column({ type: 'text' })
  at!: string; // 숫자와 ,로 이루어진 문자열

  /**
   * relations
   */
  @ManyToOne(() => TypeormComment, { onDelete: 'NO ACTION' })
  comment!: Promise<TypeormComment>;
  __comment__: Optional<TypeormComment>;
  @PrimaryColumn({ type: 'text' })
  commentId!: TypeormComment['id'];

  @OneToOne(() => TypeormMember, { onDelete: 'NO ACTION' })
  member!: Promise<TypeormMember>;
  __member__: Optional<TypeormMember>;
  @PrimaryColumn({ type: 'text' })
  memberId!: TypeormMember['id'];
}
