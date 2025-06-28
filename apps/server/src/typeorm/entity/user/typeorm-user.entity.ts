import { PrimaryColumn, Column, Entity, OneToMany } from 'typeorm';
import { Nullable, Optional, UserId } from '@repo/be-core';
import { TableAlias } from '../table-alias';
import { TypeormOauth } from '../oauth/typeorm-oauth.entity';
import { TypeormMember } from '../group/typeorm-member.entity';

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

  @OneToMany(() => TypeormMember, (member) => member.user)
  asMembers!: Promise<TypeormMember[]>;
  __asMembers__: Optional<TypeormMember[]>;
}
