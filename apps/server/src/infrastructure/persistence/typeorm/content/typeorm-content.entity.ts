import {
  ChildEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  TableInheritance,
} from "typeorm";
import { TypeormGroup } from "../group/typeorm-group.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { ContentType } from "@repo/be-core";

@Entity("Content")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormContent {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => TypeormGroup, { nullable: false })
  group!: TypeormGroup;

  @ManyToOne(() => TypeormUser, { nullable: false })
  owner!: TypeormUser;

  @Column({ type: "varchar", nullable: false })
  type!: ContentType;

  @ManyToMany(() => TypeormContent, { nullable: true })
  @JoinTable({
    name: "ContentReferences",
    joinColumn: { name: "contentId" },
    inverseJoinColumn: { name: "referencedId" },
  })
  referred?: Promise<TypeormContent[]>;

  @Column({ nullable: true })
  thumbnailRelativePath?: string;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
  @Column({ type: "datetime", nullable: true })
  updatedDateTime?: Date;
  @Column({ type: "datetime", nullable: true })
  deletedDateTime?: Date;
}

@ChildEntity()
export class TypeormSystemContent extends TypeormContent {
  override type = ContentType.SYSTEM;

  @Column({ nullable: false })
  text!: string;

  @Column({ nullable: true })
  subText?: string;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override type!: ContentType.IMAGE | ContentType.VIDEO;
  override referred: undefined = undefined;

  @Column({ nullable: false })
  thumbnailRelativePath!: string;

  @Column({ nullable: true })
  largeRelativePath?: string;

  @Column({ nullable: false })
  originalRelativePath!: string;

  @Column({ nullable: false })
  size!: number;
  @Column({ nullable: false })
  ext!: string;
  @Column({ nullable: false })
  mimetype!: string;
}

@ChildEntity()
export class TypeormPost extends TypeormContent {
  override type = ContentType.POST;
  @Column({ nullable: false })
  title!: string;
  @Column({ nullable: false })
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override type = ContentType.BUCKET;
  @Column({ nullable: false })
  title!: string;
  @Column({ type: "varchar", nullable: false })
  status!: "not-started" | "in-progress" | "done";
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override type = ContentType.SCHEDULE;
  @Column({ nullable: false })
  title!: string;

  @Column({ type: "datetime", nullable: false })
  startDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  endDateTime?: Date;

  @Column({ nullable: true })
  isAllDay?: boolean;
}
