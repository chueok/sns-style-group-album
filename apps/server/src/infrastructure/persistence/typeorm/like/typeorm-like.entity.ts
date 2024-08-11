import { Entity, PrimaryColumn, ManyToOne, Column } from "typeorm";
import { TypeormContent } from "../content/typeorm-content.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { Nullable } from "@repo/be-core";

@Entity("Like")
export class TypeormLike {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
  })
  content!: Promise<TypeormContent>;

  @ManyToOne(() => TypeormUser, { nullable: true, onDelete: "SET NULL" })
  user!: Promise<Nullable<TypeormUser>>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
}
