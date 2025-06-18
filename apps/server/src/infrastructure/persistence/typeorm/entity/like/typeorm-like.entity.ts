import { Entity, PrimaryColumn, ManyToOne, Column } from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TableAlias } from '../table-alias';
import { Optional } from '@repo/be-core';
import { TypeormMedia } from '../media/typeorm-media.entity';

@Entity(TableAlias.LIKE)
export class TypeormLike {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;

  /**
   * relations
   */
  @ManyToOne(() => TypeormMedia, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  content!: Promise<TypeormMedia>;
  __content__: Optional<TypeormMedia>;
  @Column()
  contentId!: TypeormMedia['id'];

  @ManyToOne(() => TypeormUser, { nullable: false })
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @Column()
  userId!: TypeormUser['id'];
}
