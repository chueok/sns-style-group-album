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
import {
  BucketStatusEnum,
  ContentId,
  ContentTypeEnum,
  Nullable,
  Optional,
} from "@repo/be-core";
import { TypeormComment } from "../comment/typeorm-comment.entity";
import { TypeormGroup } from "../group/typeorm-group.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { TypeormLike } from "../like/typeorm-like.entity";
import { TableAlias } from "../table-alias";

@Entity(TableAlias.CONTENT)
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class TypeormContent {
  @PrimaryColumn({ type: "text" })
  id!: ContentId;

  @Column({ type: "varchar", nullable: false })
  contentType!: ContentTypeEnum;

  @Column({ type: "text", nullable: true })
  thumbnailRelativePath!: Nullable<string>;

  @Column({ type: "datetime", nullable: false })
  createdDateTime!: Date;
  @Column({ type: "datetime", nullable: true })
  updatedDateTime!: Nullable<Date>;
  @Column({ type: "datetime", nullable: true })
  deletedDateTime!: Nullable<Date>;

  /**
   * relations
   */
  @ManyToOne(() => TypeormGroup, {
    nullable: false,
    onDelete: "CASCADE",
  })
  group!: Promise<TypeormGroup>;
  __group__: Optional<TypeormGroup>;
  @Column()
  groupId!: TypeormGroup["id"];

  @ManyToOne(() => TypeormUser, {
    nullable: false,
  })
  owner!: Promise<TypeormUser>;
  __owner__: Optional<TypeormUser>;
  @Column()
  ownerId!: TypeormUser["id"];

  @ManyToMany(() => TypeormContent)
  @JoinTable({
    name: "ContentReferences",
    joinColumn: { name: "contentId" },
    inverseJoinColumn: { name: "referencedId" },
  })
  referred!: Promise<TypeormContent[]>;
  __referred__: Optional<TypeormContent[]>;

  @OneToMany(() => TypeormComment, (comment) => comment.content)
  comments!: Promise<TypeormComment[]>;
  __comments__: Optional<TypeormComment[]>;

  @OneToMany(() => TypeormLike, (like) => like.content)
  likes!: Promise<TypeormLike[]>;
  __likes__: Optional<TypeormLike[]>;
}

@ChildEntity()
export class TypeormSystemContent extends TypeormContent {
  override contentType: ContentTypeEnum.SYSTEM = ContentTypeEnum.SYSTEM;

  @Column()
  text!: string;

  @Column({ type: "text" })
  subText!: Nullable<string>;
}

@ChildEntity()
export class TypeormMedia extends TypeormContent {
  override contentType!: ContentTypeEnum.IMAGE | ContentTypeEnum.VIDEO;
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
  override contentType = ContentTypeEnum.POST;
  @Column()
  title!: string;
  @Column()
  text!: string;
}

@ChildEntity()
export class TypeormBucket extends TypeormContent {
  override contentType = ContentTypeEnum.BUCKET;
  @Column()
  title!: string;
  @Column({ type: "varchar" })
  status!: BucketStatusEnum;
}

@ChildEntity()
export class TypeormSchedule extends TypeormContent {
  override contentType = ContentTypeEnum.SCHEDULE;
  @Column()
  title!: string;

  @Column({ type: "datetime" })
  endDateTime!: Date;

  @Column({ type: "datetime", nullable: true })
  startDateTime!: Nullable<Date>;

  @Column({ type: "boolean" })
  isAllDay!: boolean;
}

//

export function isTypeormSystemContent(
  content: TypeormContent,
): content is TypeormSystemContent {
  return content.contentType === ContentTypeEnum.SYSTEM;
}

export function isTypeormMediaContent(
  content: TypeormContent,
): content is TypeormMedia {
  return (
    content.contentType === ContentTypeEnum.IMAGE ||
    content.contentType === ContentTypeEnum.VIDEO
  );
}

export function isTypeormPostContent(
  content: TypeormContent,
): content is TypeormPost {
  return content.contentType === ContentTypeEnum.POST;
}

export function isTypeormBucketContent(
  content: TypeormContent,
): content is TypeormBucket {
  return content.contentType === ContentTypeEnum.BUCKET;
}

export function isTypeormScheduleContent(
  content: TypeormContent,
): content is TypeormSchedule {
  return content.contentType === ContentTypeEnum.SCHEDULE;
}
