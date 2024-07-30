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
import { TypeormGroup } from '../group/typeorm-group.entity';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TypeormComment } from '../comment/typeorm-comment.entity';
import { TypeormLike } from '../like/typeorm-like.entity';

@Entity('Content')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class TypeormContent {
  @PrimaryColumn()
  id!: string;

  @ManyToOne((type) => TypeormGroup, { nullable: false })
  group!: TypeormGroup;

  @ManyToOne((type) => TypeormUser, { nullable: false })
  owner!: TypeormUser;

  @Column({ type: 'varchar', nullable: false })
  type!: 'image' | 'video' | 'post' | 'bucket' | 'schedule';

  @ManyToMany((type) => TypeormContent, { nullable: true })
  @JoinTable({
    name: 'ContentReferences',
    joinColumn: { name: 'contentId' },
    inverseJoinColumn: { name: 'referencedId' },
  })
  refered?: Promise<TypeormContent[]>;

  @Column({ type: 'datetime' })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime?: Date;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime?: Date;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override type!: 'image' | 'video';
  @Column({ nullable: false })
  thumbnailRelativePath!: string;

  @Column({ nullable: true })
  largeRelativePath?: string;

  @Column({ nullable: false })
  originalRelativePath!: string;

  @Column({ nullable: false })
  size!: number;
  @Column({ nullable: false })
  ext!: string;
  @Column({ nullable: false })
  mimetype!: string;
}

@ChildEntity()
export class TypeormPost extends TypeormContent {
  override type: 'post' = 'post';
  @Column({ nullable: false })
  title!: string;
  @Column({ nullable: false })
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override type: 'bucket' = 'bucket';
  @Column()
  title!: string;
  @Column({ type: 'varchar' })
  status!: 'not-started' | 'in-progress' | 'done';
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override type: 'schedule' = 'schedule';
  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'datetime' })
  startDateTime!: Date;

  @Column({ type: 'datetime' })
  endDateTime!: Date;

  @Column()
  isAllDay!: boolean;
}
