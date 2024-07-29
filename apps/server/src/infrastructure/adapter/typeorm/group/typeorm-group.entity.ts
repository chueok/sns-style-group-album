import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity('Group')
export class TypeormGroup {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @ManyToMany((type) => TypeormUser, (user) => user.groups)
  @JoinTable({ name: 'GroupMembers' })
  members!: TypeormUser[];

  @ManyToOne((type) => TypeormUser, (user) => user.myGoups)
  owner!: TypeormUser;

  @Column({ type: 'datetime' })
  createdDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Date;
}
