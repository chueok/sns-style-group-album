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
import { BucketStatusEnum, ContentTypeEnum, Nullable } from "@repo/be-core";

@Entity("Content")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormContent {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => TypeormGroup, {
    nullable: false,
    onDelete: "CASCADE",
  })
  group!: Promise<TypeormGroup>;

  @ManyToOne(() => TypeormUser, {
    eager: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  owner!: Nullable<TypeormUser>;

  @Column({ type: "varchar", nullable: false })
  type!: ContentTypeEnum;

  @ManyToMany(() => TypeormContent, {
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "ContentReferences",
    joinColumn: { name: "contentId" },
    inverseJoinColumn: { name: "referencedId" },
  })
  referred!: Promise<TypeormContent[]>;

  @Column({ type: "text", nullable: true })
  thumbnailRelativePath!: Nullable<string>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;
  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;
}

@ChildEntity()
export class TypeormSystemContent extends TypeormContent {
  override type: ContentTypeEnum.SYSTEM = ContentTypeEnum.SYSTEM;

  @Column({ nullable: false })
  text!: string;

  @Column({ nullable: true })
  subText?: string;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override type!: ContentTypeEnum.IMAGE | ContentTypeEnum.VIDEO;
  override referred!: Promise<never[]>; // empty array

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
  override type = ContentTypeEnum.POST;
  @Column({ nullable: false })
  title!: string;
  @Column({ nullable: false })
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override type = ContentTypeEnum.BUCKET;
  @Column({ nullable: false })
  title!: string;
  @Column({ type: "varchar", nullable: false })
  status!: BucketStatusEnum;
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override type = ContentTypeEnum.SCHEDULE;
  @Column({ nullable: false })
  title!: string;

  @Column({ type: "datetime", nullable: false })
  startDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  endDateTime?: Date;

  @Column({ nullable: true })
  isAllDay?: boolean;
}
