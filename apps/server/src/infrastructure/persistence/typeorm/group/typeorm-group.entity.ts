import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity('Group')
export class TypeormGroup {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @ManyToMany(() => TypeormUser, (user) => user.groups, { nullable: false })
  @JoinTable({ name: 'GroupMembersRelation' })
  members!: Promise<TypeormUser[]>;

  @ManyToOne(() => TypeormUser, { nullable: false })
  owner!: TypeormUser;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedDateTime?: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedDateTime?: Date;
}
