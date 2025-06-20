import { PrimaryColumn, Column, ManyToMany, Entity, OneToMany } from 'typeorm';
import { TypeormGroup } from '../group/typeorm-group.entity';
import { Nullable, Optional, UserId } from '@repo/be-core';
import { TableAlias } from '../table-alias';
import { TypeormOauth } from '../oauth/typeorm-oauth.entity';
import { TypeormUserGroupProfile } from '../user-group-profile/typeorm-user-group-profile.entity';
import { TypeormJoinRequestUser } from '../group/typeorm-join-request-user.entity';

@Entity(TableAlias.USER)
export class TypeormUser {
  @PrimaryColumn({ type: 'text' })
  id!: UserId;

  @Column({ type: 'text', nullable: true, length: 20 })
  username!: Nullable<string>;

  @Column({ type: 'text', nullable: true })
  email!: Nullable<string>;

  @Column({ type: 'text', nullable: true })
  profileImageUrl!: Nullable<string>;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedDateTime!: Nullable<Date>;

  @Column({ type: 'datetime', nullable: true })
  deletedDateTime!: Nullable<Date>;

  /**
   * relations
   */
  @OneToMany(() => TypeormOauth, (oauth) => oauth.user)
  oauths!: Promise<TypeormOauth[]>;
  __oauths__: Optional<TypeormOauth[]>;

  // NOTE nullable: false를 하더라도 Join Table에서 관리 되므로 효과 없음.
  @ManyToMany(() => TypeormGroup, (group) => group.members)
  groups!: Promise<TypeormGroup[]>;
  __groups__: Optional<TypeormGroup[]>;

  @OneToMany(() => TypeormGroup, (group) => group.owner)
  ownGroups!: Promise<TypeormGroup[]>;
  __ownGroups__: Optional<TypeormGroup[]>;

  @OneToMany(() => TypeormUserGroupProfile, (profile) => profile.user)
  userGroupProfiles!: Promise<TypeormUserGroupProfile[]>;
  __userGroupProfiles__: Optional<TypeormUserGroupProfile[]>;

  @OneToMany(() => TypeormJoinRequestUser, (group) => group.user)
  joinRequestGroups!: Promise<TypeormJoinRequestUser[]>;
  __joinRequestGroups__: Optional<TypeormJoinRequestUser[]>;
}
