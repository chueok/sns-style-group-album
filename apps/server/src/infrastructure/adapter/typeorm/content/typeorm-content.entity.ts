import {
  ChildEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
} from 'typeorm';
import { TypeormGroup } from '../group/typeorm-group.entity';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity('Content')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class TypeormContent {
  @PrimaryColumn()
  id!: string;

  @ManyToOne((type) => TypeormGroup)
  group!: TypeormGroup;

  @ManyToOne((type) => TypeormUser)
  owner!: TypeormUser;

  @Column({ type: 'varchar' })
  type!: 'image' | 'video' | 'post' | 'bucket' | 'schedule';

  @ManyToMany((type) => TypeormContent)
  @JoinTable({ name: 'ContentReferences' })
  refered!: TypeormContent[];

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
  content!: string;
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
