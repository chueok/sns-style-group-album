import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { EContentCategory, Nullable, Optional } from '@repo/be-core';
import { TypeormGroup } from '../group/typeorm-group.entity';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity(TableAlias.MEDIA)
export class TypeormMedia {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'varchar', nullable: false })
  category!: EContentCategory.IMAGE | EContentCategory.VIDEO;

  @Column()
  originalRelativePath!: string;
  @Column({ type: 'text', nullable: true })
  largeRelativePath!: Nullable<string>;
  @Column({ type: 'text', nullable: true })
  thumbnailRelativePath!: Nullable<string>;

  @Column()
  size!: number;
  @Column()
  ext!: string;
  @Column()
  mimeType!: string;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Nullable<Date>;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Nullable<Date>;

  /**
   * relations
   */
  @ManyToOne(() => TypeormGroup, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  group!: Promise<TypeormGroup>;
  __group__: Optional<TypeormGroup>;
  @Column()
  groupId!: TypeormGroup['id'];

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  __owner__: Optional<TypeormUser>;
  @Column()
  ownerId!: TypeormUser['id'];
}
