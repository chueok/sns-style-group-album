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

  @Column({ nullable: false })
  text!: string;

  @ManyToOne((type) => TypeormUser, { nullable: false })
  owner!: TypeormUser;

  @ManyToMany((type) => TypeormUser, { nullable: true })
  @JoinTable({ name: 'CommentTags' })
  tags!: TypeormUser[];

  @ManyToOne((type) => TypeormContent, (content) => content.comments, {
    nullable: false,
  })
  target!: TypeormContent;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Date;
}
