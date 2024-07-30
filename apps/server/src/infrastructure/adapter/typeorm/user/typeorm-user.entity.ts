import {
  OneToMany,
  PrimaryColumn,
  Column,
  ManyToMany,
  Entity,
  ManyToOne,
} from 'typeorm';
import { TypeormGroup } from '../group/typeorm-group.entity';

@Entity('User')
export class TypeormUser {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  username!: string;

  @Column({ nullable: false })
  hashedPassword!: string;

  @ManyToMany((type) => TypeormGroup, (group) => group.members, {
    nullable: true,
    eager: true,
  })
  groups?: TypeormGroup[];

  @Column({ type: 'datetime' })
  createdDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedDateTime?: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedDateTime?: Date;
}
