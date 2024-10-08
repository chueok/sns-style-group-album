import { Entity, PrimaryColumn, ManyToOne, Column } from "typeorm";
import { TypeormContent } from "../content/typeorm-content.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TableAlias } from "../table-alias";
import { ContentId, Optional, UserId } from "@repo/be-core";

@Entity(TableAlias.LIKE)
export class TypeormLike {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;

  @ManyToOne(() => TypeormContent, {
    nullable: false,
    onDelete: "CASCADE",
  })
  content!: Promise<TypeormContent>;
  __content__: Optional<TypeormContent>;
  @Column()
  contentId!: ContentId;

  @ManyToOne(() => TypeormUser, { nullable: false })
  user!: Promise<TypeormUser>;
  __user__: Optional<TypeormUser>;
  @Column()
  userId!: UserId;
}
