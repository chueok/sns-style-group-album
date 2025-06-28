import { Entity, PrimaryColumn, ManyToOne, Column } from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TableAlias } from '../table-alias';
import { Optional } from '@repo/be-core';
import { TypeormContent } from '../content/typeorm-content.entity';

@Entity(TableAlias.LIKE)
export class TypeormLike {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;

  /**
   * relations
   */
  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  content!: Promise<TypeormContent>;
  __content__: Optional<TypeormContent>;
  @Column()
  contentId!: TypeormContent['id'];

  @ManyToOne(() => TypeormUser, { nullable: false })
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @Column()
  userId!: TypeormUser['id'];
}
