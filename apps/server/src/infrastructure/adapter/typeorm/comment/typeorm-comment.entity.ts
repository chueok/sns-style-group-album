import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TypeormContent } from '../content/typeorm-content.entity';

@Entity('Comment')
export class TypeormComment {
  @PrimaryColumn()
  id!: string;

  @Column()
  content!: string;

  @ManyToOne((type) => TypeormUser)
  owner!: TypeormUser;

  @ManyToMany((type) => TypeormUser)
  @JoinTable({ name: 'CommentTags' })
  tags!: TypeormUser[];

  @ManyToOne((type) => TypeormContent)
  target!: TypeormContent;

  @Column({ type: 'datetime' })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Date;
}
