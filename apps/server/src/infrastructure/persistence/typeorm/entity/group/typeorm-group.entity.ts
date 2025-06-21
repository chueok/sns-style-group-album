import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { GroupId, Nullable, Optional } from '@repo/be-core';
import { TypeormUser } from '../user/typeorm-user.entity';
import { TableAlias } from '../table-alias';
import { TypeormMember } from './typeorm-group-member.entity';

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
  @OneToMany(() => TypeormMember, (member) => member.group)
  members!: Promise<TypeormMember[]>;
  __members__: Optional<TypeormMember[]>;

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  __owner__: Optional<TypeormUser>;
  @Column()
  ownerId!: TypeormUser['id'];
}
