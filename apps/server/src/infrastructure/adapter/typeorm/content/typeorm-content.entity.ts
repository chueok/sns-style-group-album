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
  refered!: TypeormContent[];

  @OneToMany((type) => TypeormComment, (comment) => comment.target, {
    nullable: true,
  })
  comments!: TypeormComment[];

  @OneToMany((type) => TypeormLike, (like) => like.content, { nullable: true })
  likes!: TypeormLike[];

  @Column({ type: 'datetime' })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Date;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override type!: 'image' | 'video';
  @Column()
  relativePath!: string;
  @Column()
  size!: number;
  @Column()
  ext!: string;
  @Column()
  mimetype!: string;
}

@ChildEntity()
export class TypeormPost extends TypeormContent {
  override type: 'post' = 'post';
  @Column()
  title!: string;
  @Column()
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
  @Column()
  title!: string;

  @Column({ type: 'datetime' })
  startDateTime!: Date;

  @Column({ type: 'datetime' })
  endDateTime!: Date;

  @Column()
  isAllDay!: boolean;
}
