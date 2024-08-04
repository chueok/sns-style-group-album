import { Entity, PrimaryColumn, OneToMany, ManyToOne, Column } from 'typeorm';
import { TypeormContent } from '../content/typeorm-content.entity';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity('Like')
export class TypeormLike {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
  })
  content!: Promise<TypeormContent>;

  @ManyToOne(() => TypeormUser, { nullable: false })
  user!: Promise<TypeormUser>;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
}
