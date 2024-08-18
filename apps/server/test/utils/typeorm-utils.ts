import {
  BucketStatusEnum,
  CommentTypeEnum,
  ContentTypeEnum,
} from "@repo/be-core";
import { DataSource } from "typeorm";
import {
  TypeormComment,
  TypeormSystemComment,
  TypeormUserComment,
} from "../../src/infrastructure/persistence/typeorm/comment/typeorm-comment.entity";
import { TypeormUser } from "../../src/infrastructure/persistence/typeorm/user/typeorm-user.entity";
import { TypeormGroup } from "../../src/infrastructure/persistence/typeorm/group/typeorm-group.entity";
import { faker } from "@faker-js/faker";
import {
  TypeormBucket,
  TypeormContent,
  TypeormMedia,
  TypeormPost,
  TypeormSchedule,
  TypeormSystemContent,
} from "../../src/infrastructure/persistence/typeorm/content/typeorm-content.entity";

import { add } from "date-fns";
import { copyFile } from "fs/promises";

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export class TestDatabaseHandler {
  // 종속성이 없는 엔티티 순서대로
  entities = [
    TypeormUser,
    TypeormGroup,
    TypeormContent,
    TypeormComment,
  ] as const;

  private listMap: Record<string, any[]>;
  public getListMap<T extends ArrayElement<typeof this.entities>>(
    constructor: T,
  ): InstanceType<T>[] {
    return this.listMap[constructor.name] as InstanceType<T>[];
  }

  constructor(private dataSource: DataSource) {
    this.listMap = {};
    Object.values(this.entities).forEach((v) => {
      this.listMap[v.name] = [];
    });
  }

  async clearDatabase(): Promise<void> {
    // Pormise.all 사용하지 말것. 순차적으로 삭제 필요
    for (const entity of [...this.entities].reverse()) {
      await this.dataSource.getRepository(entity).delete({});
    }
    this.reset();
  }

  async buildDummyData(payload: {
    numUser: number;
    numGroup: number;
    numContent: number;
    numComment: number;
  }): Promise<void> {
    for (let i = 0; i < payload.numUser; i++) {
      this.makeDummyUser();
    }
    for (let i = 0; i < payload.numGroup; i++) {
      this.makeDummyGroup();
    }
    for (let i = 0; i < payload.numContent; i++) {
      this.makeDummyContent();
    }
    for (let i = 0; i < payload.numComment; i++) {
      this.makeDummyComment();
    }
  }

  async commit(): Promise<void> {
    for (const entity of this.entities) {
      const list = this.getListMap(entity);
      await this.dataSource.getRepository(entity).save(list);
    }
  }

  async load(dbPath: string): Promise<void> {
    if (typeof this.dataSource.options.database !== "string") {
      throw new Error("Database is not a file");
    }
    await this.dataSource.destroy();
    await copyFile(dbPath, this.dataSource.options.database);
    await this.dataSource.initialize();
    for (const entity of this.entities) {
      const list = await this.dataSource.getRepository(entity).find();
      this.getListMap(entity).push(...list);
    }
  }

  reset(): void {
    this.entities.forEach((entity) => {
      this.getListMap(entity).length = 0;
    });
  }

  makeDummyUser(): TypeormUser {
    const typeormEntity = new TypeormUser();
    typeormEntity.id = faker.string.uuid();
    typeormEntity.username = faker.internet.userName();
    typeormEntity.hashedPassword = faker.internet.password();
    typeormEntity.groups = Promise.resolve([]);
    typeormEntity.thumbnailRelativePath = getRandomElement([
      null,
      faker.system.filePath(),
    ]);

    typeormEntity.createdDateTime = faker.date.past();
    typeormEntity.updatedDateTime = getRandomElement([null, faker.date.past()]);
    typeormEntity.deletedDateTime = getRandomElement([null, faker.date.past()]);

    this.getListMap(TypeormUser).push(typeormEntity);

    return typeormEntity;
  }

  makeDummyGroup(): TypeormGroup {
    const userList = this.getListMap(TypeormUser);
    if (userList.length === 0) {
      throw new Error("User is empty");
    }
    const typeormEntity = new TypeormGroup();
    typeormEntity.id = faker.string.uuid();
    typeormEntity.name = faker.internet.userName();
    typeormEntity.members = Promise.resolve([]);
    typeormEntity.owner = Promise.resolve(getRandomElement(userList));

    typeormEntity.createdDateTime = faker.date.past();
    typeormEntity.updatedDateTime = getRandomElement([null, faker.date.past()]);
    typeormEntity.deletedDateTime = getRandomElement([null, faker.date.past()]);

    this.getListMap(TypeormGroup).push(typeormEntity);
    return typeormEntity;
  }

  makeDummyContent(): TypeormContent {
    const groupList = this.getListMap(TypeormGroup);
    const userList = this.getListMap(TypeormUser);
    const contentList = this.getListMap(TypeormContent);
    if (groupList.length === 0 || userList.length === 0) {
      throw new Error("Group or User is empty");
    }

    const contentType = getRandomElement(Object.values(ContentTypeEnum));

    let instance!: TypeormContent;
    switch (contentType) {
      case ContentTypeEnum.IMAGE:
      case ContentTypeEnum.VIDEO:
        instance = new TypeormMedia();
        break;
      case ContentTypeEnum.POST:
        instance = new TypeormPost();
        break;
      case ContentTypeEnum.SCHEDULE:
        instance = new TypeormSchedule();
        break;
      case ContentTypeEnum.BUCKET:
        instance = new TypeormBucket();
        break;
      case ContentTypeEnum.SYSTEM:
        instance = new TypeormSystemContent();
        break;
    }
    instance.id = faker.string.uuid();
    instance.group = Promise.resolve(getRandomElement(groupList));
    instance.owner = getRandomElement(userList);
    instance.type = contentType;
    instance.referred = Promise.resolve([]);
    if (contentList.length > 0) {
      const num = Math.random() * contentList.length;
      const referred: Set<TypeormContent> = new Set();
      for (let i = 0; i < num; i++) {
        referred.add(getRandomElement(contentList));
      }
      instance.referred = Promise.resolve(Array.from(referred));
    }
    instance.thumbnailRelativePath = getRandomElement([
      null,
      faker.system.filePath(),
    ]);

    instance.createdDateTime = faker.date.past();
    instance.updatedDateTime = getRandomElement([undefined, faker.date.past()]);
    instance.deletedDateTime = getRandomElement([undefined, faker.date.past()]);

    let dates: Date[];
    switch (contentType) {
      case ContentTypeEnum.IMAGE:
        (instance as TypeormMedia).referred = Promise.resolve([]);
        (instance as TypeormMedia).thumbnailRelativePath =
          faker.system.filePath();
        (instance as TypeormMedia).largeRelativePath = faker.system.filePath();
        (instance as TypeormMedia).originalRelativePath =
          faker.system.filePath();
        (instance as TypeormMedia).size = faker.number.int();
        (instance as TypeormMedia).ext = faker.system.commonFileExt();
        break;
      case ContentTypeEnum.VIDEO:
        (instance as TypeormMedia).referred = Promise.resolve([]);
        (instance as TypeormMedia).thumbnailRelativePath =
          faker.system.filePath();
        (instance as TypeormMedia).largeRelativePath = undefined;
        (instance as TypeormMedia).originalRelativePath =
          faker.system.filePath();
        (instance as TypeormMedia).size = faker.number.int();
        (instance as TypeormMedia).ext = faker.system.commonFileExt();
        break;
      case ContentTypeEnum.POST:
        (instance as TypeormPost).title = faker.lorem.sentence();
        (instance as TypeormPost).text = faker.lorem.paragraph();
        break;
      case ContentTypeEnum.SCHEDULE:
        (instance as TypeormSchedule).title = faker.lorem.sentence();
        dates = faker.date.betweens({
          from: add(new Date(), { years: -1 }),
          to: add(new Date(), { years: 1 }),
          count: 2,
        });
        (instance as TypeormSchedule).startDateTime = dates[0] as Date;
        (instance as TypeormSchedule).endDateTime = getRandomElement([
          undefined,
          dates[1],
        ]);
        (instance as TypeormSchedule).isAllDay = getRandomElement([
          false,
          true,
        ]);
        break;
      case ContentTypeEnum.BUCKET:
        (instance as TypeormBucket).title = faker.lorem.sentence();
        (instance as TypeormBucket).status = getRandomElement(
          Object.values(BucketStatusEnum),
        );
        break;

      case ContentTypeEnum.SYSTEM:
        (instance as TypeormSystemContent).text = faker.lorem.sentence();
        (instance as TypeormSystemContent).subText = getRandomElement([
          undefined,
          faker.lorem.sentence(),
        ]);
        break;
    }

    contentList.push(instance);
    return instance;
  }

  makeDummyComment(): TypeormComment {
    const contentList = this.getListMap(TypeormContent);
    const userList = this.getListMap(TypeormUser);
    const commentList = this.getListMap(TypeormComment);
    if (contentList.length === 0 || userList.length === 0) {
      throw new Error("Content or User is empty");
    }

    const commentType = getRandomElement(Object.values(CommentTypeEnum));

    let instance: TypeormComment;
    switch (commentType) {
      case CommentTypeEnum.USER_COMMENT:
        instance = new TypeormUserComment();
        break;
      case CommentTypeEnum.SYSTEM_COMMENT:
        instance = new TypeormSystemComment();
        break;
    }

    instance.id = faker.string.uuid();
    instance.type = commentType;
    instance.text = faker.lorem.sentence();
    instance.contentId = getRandomElement(contentList).id;

    instance.createdDateTime = faker.date.past();
    instance.updatedDateTime = getRandomElement([undefined, faker.date.past()]);
    instance.deletedDateTime = getRandomElement([undefined, faker.date.past()]);

    let itterNum: number;
    let tags: Set<TypeormUser>;
    switch (commentType) {
      case CommentTypeEnum.USER_COMMENT:
        (instance as TypeormUserComment).owner = Promise.resolve(
          getRandomElement([null, ...userList]),
        );
        itterNum = Math.random() * userList.length;
        tags = new Set();
        for (let i = 0; i < itterNum; i++) {
          tags.add(getRandomElement(userList));
        }
        (instance as TypeormUserComment).tags = Promise.resolve(
          Array.from(tags),
        );
        break;
      case CommentTypeEnum.SYSTEM_COMMENT:
        (instance as TypeormSystemComment).subText = getRandomElement([
          null,
          faker.lorem.sentence(),
        ]);
        break;
    }

    commentList.push(instance);
    return instance;
  }
}

function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Array is empty");
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array.at(randomIndex) as T;
}
