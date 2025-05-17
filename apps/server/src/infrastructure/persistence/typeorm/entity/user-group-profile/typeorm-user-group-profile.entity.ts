import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { TypeormUser } from '../user/typeorm-user.entity';
import { Optional } from '@repo/be-core';
import { TypeormGroup } from '../group/typeorm-group.entity';

@Entity(TableAlias.USER_GROUP_PROFILE)
export class TypeormUserGroupProfile {
  @Column({ type: 'text', nullable: false })
  nickname!: string;

  @Column({ type: 'boolean', nullable: false })
  hasProfileImage!: boolean;

  /**
   * relations
   */
  @ManyToOne(() => TypeormUser, (user) => user.userGroupProfiles, {
    onDelete: 'CASCADE',
  })
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @PrimaryColumn({ type: 'text' })
  userId!: TypeormUser['id'];

  @ManyToOne(() => TypeormGroup, { onDelete: 'CASCADE' })
  group!: Promise<TypeormGroup>;
  __group__: Optional<TypeormGroup>;
  @PrimaryColumn({ type: 'text' })
  groupId!: TypeormGroup['id'];
}
