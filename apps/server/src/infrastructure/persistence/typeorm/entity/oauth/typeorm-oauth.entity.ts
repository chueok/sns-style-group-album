import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { TypeormUser } from '../user/typeorm-user.entity';
import { Nullable, Optional } from '@repo/be-core';

@Entity(TableAlias.OAUTH)
export class TypeormOauth {
  @PrimaryColumn()
  provider!: string;

  @PrimaryColumn()
  providerId!: string;

  @Column({ type: 'text', nullable: true })
  email!: Nullable<string>;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;

  /**
   * relations
   */
  @ManyToOne(() => TypeormUser, (user) => user.oauths)
  user!: Promise<Nullable<TypeormUser>>;
  __user__: Optional<Nullable<TypeormUser>>;
  @Column({ type: 'text', nullable: true })
  userId!: Nullable<TypeormUser['id']>;
}
