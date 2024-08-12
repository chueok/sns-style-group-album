import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
  ChildEntity,
} from "typeorm";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TypeormContent } from "../content/typeorm-content.entity";
import { CommentTypeEnum } from "@repo/be-core";

@Entity("Comment")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormComment {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  type!: CommentTypeEnum;

  @Column({ nullable: false })
  text!: string;

  @ManyToOne(() => TypeormContent, {
    nullable: true,
  })
  content?: Promise<TypeormContent>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
  @Column({ type: "datetime", nullable: true })
  updatedDateTime?: Date;
  @Column({ type: "datetime", nullable: true })
  deletedDateTime?: Date;
}

@ChildEntity()
export class TypeormUserComment extends TypeormComment {
  override type = CommentTypeEnum.USER_COMMENT;

  // child entity 이기 때문에 nullable false로 설정할 경우 문제 될 것으로 보임.
  @ManyToOne(() => TypeormUser, { nullable: false, eager: true })
  owner!: TypeormUser;

  @ManyToMany(() => TypeormUser, { nullable: true })
  @JoinTable({ name: "CommentTagsRelation" })
  tags?: Promise<TypeormUser[]>;
}

@ChildEntity()
export class TypeormSystemComment extends TypeormComment {
  override type = CommentTypeEnum.SYSTEM_COMMENT;

  @Column({ nullable: true })
  subText?: string;
}
