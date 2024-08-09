import { PrimaryColumn, Column, ManyToMany, Entity } from "typeorm";
import { TypeormGroup } from "../group/typeorm-group.entity";

@Entity("User")
export class TypeormUser {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  username!: string;

  @Column({ nullable: false })
  hashedPassword!: string;

  @Column({ nullable: true })
  thumbnailRelativePath?: string;

  @ManyToMany(() => TypeormGroup, (group) => group.members, {
    eager: true,
    nullable: false,
  })
  groups!: TypeormGroup[];

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  updatedDateTime?: Date;

  @Column({ type: "datetime", nullable: true })
  deletedDateTime?: Date;
}
