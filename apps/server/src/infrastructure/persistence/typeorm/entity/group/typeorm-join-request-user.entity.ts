import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { TypeormGroup } from './typeorm-group.entity';
import { Optional } from '@repo/be-core';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity(TableAlias.JOIN_REQUEST_USER)
export class TypeormJoinRequestUser {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => TypeormGroup, (group) => group.joinRequestUsers)
  group!: Promise<TypeormGroup>;
  __group__: Optional<TypeormGroup>;
  @Column()
  groupId!: TypeormGroup['id'];

  @ManyToOne(() => TypeormUser, (user) => user.joinRequestGroups)
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @Column()
  userId!: TypeormUser['id'];

  @Column({ type: 'text', nullable: true, default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'datetime', nullable: false })
  requestedDateTime!: Date;
}
