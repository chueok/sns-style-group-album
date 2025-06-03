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
import { TypeormUser } from '../user/typeorm-user.entity';
import { TypeormLike } from '../like/typeorm-like.entity';
import { TableAlias } from '../table-alias';

@Entity(TableAlias.CONTENT)
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class TypeormContent {
  @PrimaryColumn({ type: 'text' })
  id!: ContentId;

  @Column({ type: 'varchar', nullable: false })
  contentCategory!: EContentCategory;

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

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  __owner__: Optional<TypeormUser>;
  @Column()
  ownerId!: TypeormUser['id'];

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
  override contentCategory: EContentCategory.SYSTEM = EContentCategory.SYSTEM;

  @Column()
  text!: string;

  @Column({ type: 'text' })
  subText!: Nullable<string>;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override contentCategory!: EContentCategory.IMAGE | EContentCategory.VIDEO;
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
  override contentCategory = EContentCategory.POST;
  @Column()
  title!: string;
  @Column()
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override contentCategory = EContentCategory.BUCKET;
  @Column()
  title!: string;
  @Column({ type: 'varchar' })
  status!: EBucketStatus;
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override contentCategory = EContentCategory.SCHEDULE;
  @Column()
  title!: string;

  @Column({ type: 'datetime' })
  endDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  startDateTime!: Nullable<Date>;

  @Column({ type: 'boolean' })
  isAllDay!: boolean;
}

//

export function isTypeormSystemContent(
  content: TypeormContent
): content is TypeormSystemContent {
  return content.contentCategory === EContentCategory.SYSTEM;
}

export function isTypeormMediaContent(
  content: TypeormContent
): content is TypeormMedia {
  return (
    content.contentCategory === EContentCategory.IMAGE ||
    content.contentCategory === EContentCategory.VIDEO
  );
}

export function isTypeormPostContent(
  content: TypeormContent
): content is TypeormPost {
  return content.contentCategory === EContentCategory.POST;
}

export function isTypeormBucketContent(
  content: TypeormContent
): content is TypeormBucket {
  return content.contentCategory === EContentCategory.BUCKET;
}

export function isTypeormScheduleContent(
  content: TypeormContent
): content is TypeormSchedule {
  return content.contentCategory === EContentCategory.SCHEDULE;
}
