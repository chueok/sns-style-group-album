import { OneToMany, PrimaryColumn, Column, ManyToMany, Entity } from 'typeorm';
import { TypeormGroup } from '../group/typeorm-group.entity';

@Entity()
export class TypeormUser {
  @PrimaryColumn()
  id!: string;

  @Column()
  username!: string;

  @Column()
  hashedPassword!: string;

  @ManyToMany((type) => TypeormGroup, (group) => group.members)
  groups!: TypeormGroup[];

  @OneToMany((type) => TypeormGroup, (group) => group.owner)
  myGoups!: TypeormGroup[];

  @Column({ type: 'datetime' })
  createdDateTime!: Date;

  @Column({ type: 'datetime' })
  updatedDateTime!: Date;

  @Column({ type: 'datetime' })
  deletedDateTime!: Date;
}
