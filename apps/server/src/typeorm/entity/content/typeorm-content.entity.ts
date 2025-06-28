import {
  ChildEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  TableInheritance,
} from 'typeorm';
import {
  EBucketStatus,
  ContentId,
  EContentCategory,
  Nullable,
  Optional,
} from '@repo/be-core';
import { TypeormComment } from '../comment/typeorm-comment.entity';
import { TypeormGroup } from '../group/typeorm-group.entity';
import { TypeormLike } from '../like/typeorm-like.entity';
import { TableAlias } from '../table-alias';
import { TypeormMember } from '../group/typeorm-member.entity';

@Entity(TableAlias.CONTENT)
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class TypeormContent {
  @PrimaryColumn({ type: 'text' })
  id!: ContentId;

  @Column({ type: 'varchar', nullable: false })
  category!: EContentCategory;

  @Column({ type: 'text', nullable: true })
  thumbnailRelativePath!: Nullable<string>;

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

  @ManyToOne(() => TypeormMember, {
    nullable: false,
  })
  owner!: Promise<TypeormMember>;
  __owner__: Optional<TypeormMember>;
  @Column()
  ownerId!: TypeormMember['id'];

  @ManyToMany(() => TypeormContent)
  @JoinTable({
    name: 'ContentReferences',
    joinColumn: { name: 'contentId' },
    inverseJoinColumn: { name: 'referencedId' },
  })
  referred!: Promise<TypeormContent[]>;
  __referred__: Optional<TypeormContent[]>;

  @OneToMany(() => TypeormComment, (comment) => comment.content)
  comments!: Promise<TypeormComment[]>;
  __comments__: Optional<TypeormComment[]>;

  @OneToMany(() => TypeormLike, (like) => like.content)
  likes!: Promise<TypeormLike[]>;
  __likes__: Optional<TypeormLike[]>;
}

@ChildEntity()
export class TypeormSystemContent extends TypeormContent {
  override category: EContentCategory.SYSTEM = EContentCategory.SYSTEM;

  @Column()
  text!: string;

  @Column({ type: 'text' })
  subText!: Nullable<string>;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override category!: EContentCategory.IMAGE | EContentCategory.VIDEO;
  override referred!: Promise<never[]>; // empty array

  @Column({ type: 'text' })
  largeRelativePath!: Nullable<string>;

  @Column()
  originalRelativePath!: string;

  @Column()
  size!: number;
  @Column()
  ext!: string;
  @Column()
  mimeType!: string;
}

@ChildEntity()
export class TypeormPost extends TypeormContent {
  override category = EContentCategory.POST;
  @Column()
  title!: string;
  @Column()
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override category = EContentCategory.BUCKET;
  @Column()
  title!: string;
  @Column({ type: 'varchar' })
  status!: EBucketStatus;
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override category = EContentCategory.SCHEDULE;
  @Column()
  title!: string;

  @Column({ type: 'datetime' })
  endDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  startDateTime!: Nullable<Date>;

  @Column({ type: 'boolean' })
  isAllDay!: boolean;
}
