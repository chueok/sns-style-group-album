import { Entity, PrimaryColumn, OneToMany, ManyToOne, Column } from 'typeorm';
import { TypeormContent } from '../content/typeorm-content.entity';
import { TypeormUser } from '../user/typeorm-user.entity';

@Entity('Like')
export class TypeormLike {
  @PrimaryColumn()
  id!: string;

  @ManyToOne((type) => TypeormContent, (content) => content.likes, {
    nullable: false,
  })
  content!: TypeormContent;

  @ManyToOne((type) => TypeormUser, { nullable: false })
  user!: TypeormUser;

  @Column({ type: 'datetime', nullable: false })
  createdDateTime!: Date;
}
