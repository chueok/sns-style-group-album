import { Entity, PrimaryColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity()
export class TypeormGroup {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @ManyToMany((type) => TypeormUser, (user) => user.groups)
  members!: TypeormUser[];

  @ManyToOne((type) => TypeormUser, (user) => user.myGoups)
  owner!: TypeormUser;
}
