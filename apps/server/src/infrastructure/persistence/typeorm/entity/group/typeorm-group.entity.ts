import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { GroupId, Nullable, Optional } from '@repo/be-core';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TableAlias } from '../table-alias';
import { TypeormUserGroupProfile } from '../user-group-profile/typeorm-user-group-profile.entity';
import { TypeormJoinRequestUser } from './typeorm-group-join-user.entity';

@Entity(TableAlias.GROUP)
export class TypeormGroup {
  @PrimaryColumn({ type: 'text' })
  id!: GroupId;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Nullable<Date>;

  @Column({ type: 'text', nullable: true })
  invitationCode!: Nullable<string>;

  /**
   * relations
   */
  @ManyToMany(() => TypeormUser, (user) => user.groups)
  @JoinTable({ name: 'GroupMembersRelation' })
  members!: Promise<TypeormUser[]>;
  __members__: Optional<TypeormUser[]>;

  @OneToMany(() => TypeormUserGroupProfile, (user) => user.group)
  memberProfiles!: Promise<TypeormUserGroupProfile[]>;
  __memberProfiles__: Optional<TypeormUserGroupProfile[]>;

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  __owner__: Optional<TypeormUser>;
  @Column()
  ownerId!: TypeormUser['id'];

  @OneToMany(() => TypeormJoinRequestUser, (user) => user.group)
  joinRequestUsers!: Promise<TypeormJoinRequestUser[]>;
  __joinRequestUsers__: Optional<TypeormJoinRequestUser[]>;
}
