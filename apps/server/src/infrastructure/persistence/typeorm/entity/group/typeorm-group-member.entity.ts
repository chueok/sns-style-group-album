import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { Nullable, Optional } from '@repo/be-core';
import { TypeormGroup } from './typeorm-group.entity';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity(TableAlias.MEMBER)
export class TypeormMember {
  @PrimaryGeneratedColumn()
  relationId!: string;

  @ManyToOne(() => TypeormGroup, (group) => group.members)
  group!: Promise<TypeormGroup>;
  __group__: Optional<TypeormGroup>;
  @Column()
  groupId!: TypeormGroup['id'];

  @ManyToOne(() => TypeormUser, (user) => user.asMembers)
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @Column()
  userId!: TypeormUser['id'];

  @Column({ type: 'text', nullable: false })
  username!: string;

  @Column({ type: 'text', nullable: true })
  role!: 'owner' | 'member';

  @Column({ type: 'text', nullable: false, default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected' | 'droppedOut' | 'left';

  @Column({ type: 'text', nullable: true })
  profileImageUrl!: Nullable<string>;

  @Column({ type: 'datetime', nullable: false })
  joinRequestDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  joinDateTime!: Nullable<Date>;

  @Column({ type: 'datetime', nullable: true })
  leaveDateTime!: Nullable<Date>;

  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Nullable<Date>;
}
