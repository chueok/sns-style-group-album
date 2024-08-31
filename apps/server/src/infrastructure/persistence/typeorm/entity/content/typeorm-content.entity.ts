import {
  ChildEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  TableInheritance,
} from "typeorm";
import { BucketStatusEnum, ContentTypeEnum, Nullable } from "@repo/be-core";
import { TypeormComment } from "../comment/typeorm-comment.entity";
import { TypeormGroup } from "../group/typeorm-group.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TypeormLike } from "../like/typeorm-like.entity";

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
  @Column()
  groupId!: string;

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  @Column()
  ownerId!: string;

  @Column({ type: "varchar", nullable: false })
  type!: ContentTypeEnum;

  @ManyToMany(() => TypeormContent)
  @JoinTable({
    name: "ContentReferences",
    joinColumn: { name: "contentId" },
    inverseJoinColumn: { name: "referencedId" },
  })
  referred!: Promise<TypeormContent[]>;

  @Column({ type: "text", nullable: true })
  thumbnailRelativePath!: Nullable<string>;

  @OneToMany(() => TypeormComment, (comment) => comment.content)
  comments!: Promise<TypeormComment[]>;

  @OneToMany(() => TypeormLike, (like) => like.content)
  likes!: Promise<TypeormLike[]>;

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

  @Column()
  text!: string;

  @Column({ type: "text" })
  subText!: Nullable<string>;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override type!: ContentTypeEnum.IMAGE | ContentTypeEnum.VIDEO;
  override referred!: Promise<never[]>; // empty array

  @Column({ type: "text" })
  largeRelativePath!: Nullable<string>;

  @Column()
  originalRelativePath!: string;

  @Column()
  size!: number;
  @Column()
  ext!: string;
  @Column()
  mimetype!: string;
}

@ChildEntity()
export class TypeormPost extends TypeormContent {
  override type = ContentTypeEnum.POST;
  @Column()
  title!: string;
  @Column()
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override type = ContentTypeEnum.BUCKET;
  @Column()
  title!: string;
  @Column({ type: "varchar" })
  status!: BucketStatusEnum;
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override type = ContentTypeEnum.SCHEDULE;
  @Column()
  title!: string;

  @Column({ type: "datetime" })
  startDateTime!: Date;

  @Column({ type: "datetime" })
  endDateTime!: Nullable<Date>;

  @Column({ type: "boolean" })
  isAllDay!: Nullable<boolean>;
}