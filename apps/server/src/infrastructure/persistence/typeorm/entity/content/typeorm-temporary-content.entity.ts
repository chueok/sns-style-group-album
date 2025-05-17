import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TableAlias } from '../table-alias';

@Entity(TableAlias.TEMPORARY_CONTENT)
export class TypeormTemporaryContent {
  @PrimaryColumn()
  id!: string;

  @Column()
  groupId!: string;

  @Column()
  ownerId!: string;
}
