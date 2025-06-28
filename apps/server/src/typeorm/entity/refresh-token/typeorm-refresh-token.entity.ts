import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TableAlias } from '../table-alias';
import { UserId } from '@repo/be-core';

// TODO: device 별로 별도 token을 가지도록 변경 필요
@Entity(TableAlias.REFRESH_TOKEN)
export class TypeormRefreshToken {
  @PrimaryColumn()
  userId!: UserId;

  @Column({ type: 'text', nullable: false })
  token!: string;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
}
