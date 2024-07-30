import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
  ChildEntity,
} from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TypeormContent } from '../content/typeorm-content.entity';

@Entity('Comment')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class TypeormComment {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  text!: string;

  @ManyToMany((type) => TypeormContent, {
    nullable: true,
  })
  @JoinTable({
    name: 'CommentContentsRelation',
    joinColumn: { name: 'commentId' },
    inverseJoinColumn: { name: 'contentId' },
  })
  targets?: Promise<TypeormContent[]>;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
  @Column({ type: 'datetime', nullable: true })
  updatedDateTime?: Date;
  @Column({ type: 'datetime', nullable: true })
  deletedDateTime?: Date;
}

@ChildEntity()
export class TypeormUserComment extends TypeormComment {
  // child entity 이기 때문에 nullable false로 설정할 경우 문제 될 것으로 보임.
  @ManyToOne((type) => TypeormUser, { nullable: false, eager: true })
  owner!: TypeormUser;

  @ManyToMany((type) => TypeormUser, { nullable: true })
  @JoinTable({ name: 'CommentTagsRelation' })
  tags?: Promise<TypeormUser[]>;
}

@ChildEntity()
export class TypeormSystemComment extends TypeormComment {
  @Column({ nullable: true })
  subText?: string;
}
