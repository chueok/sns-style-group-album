import { Entity, PrimaryColumn, ManyToOne, Column } from "typeorm";
import { TypeormContent } from "../content/typeorm-content.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TableAlias } from "../table-alias";
import { ContentId, UserId } from "@repo/be-core";

@Entity(TableAlias.LIKE)
export class TypeormLike {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: "CASCADE",
  })
  content!: Promise<TypeormContent>;
  @Column()
  contentId!: ContentId;

  @ManyToOne(() => TypeormUser, { nullable: false })
  user!: Promise<TypeormUser>;
  @Column()
  userId!: UserId;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
}
