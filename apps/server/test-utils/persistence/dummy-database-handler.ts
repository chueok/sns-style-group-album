import {
  BucketStatusEnum,
  CommentId,
  CommentTypeEnum,
  ContentId,
  ContentTypeEnum,
  CustomAssert,
  GroupId,
  UserId,
} from '@repo/be-core';
import { DataSource } from 'typeorm';
import {
  TypeormComment,
  TypeormSystemComment,
  TypeormUserComment,
} from '../../src/infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';
import { TypeormUser } from '../../src/infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { TypeormGroup } from '../../src/infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { faker } from '@faker-js/faker';
import {
  TypeormBucket,
  TypeormContent,
  TypeormMedia,
  TypeormPost,
  TypeormSchedule,
  TypeormSystemContent,
} from '../../src/infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';

import { add } from 'date-fns';
import { copyFile } from 'fs/promises';
import { TypeormLike } from '../../src/infrastructure/persistence/typeorm/entity/like/typeorm-like.entity';
import { TypeormUserGroupProfile } from '../../src/infrastructure/persistence/typeorm/entity/user-group-profile/typeorm-user-group-profile.entity';
import { TypeormCommentUserTag } from '../../src/infrastructure/persistence/typeorm/entity/commet-user-tag/typeorm-comment-user-tag.entity';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export class DummyDatabaseHandler {
  // 종속성이 없는 엔티티 순서대로
  entities = [
    TypeormUser,
    TypeormGroup,
    TypeormUserGroupProfile,
    TypeormContent,
    TypeormComment,
    TypeormCommentUserTag,
    TypeormLike,
  ] as const;

  private temporaryEntityListMap: Record<string, any[]> = {};
  private getTemporaryEntityList<T extends ArrayElement<typeof this.entities>>(
    constructor: T
  ): InstanceType<T>[] {
    return this.temporaryEntityListMap[constructor.name] as InstanceType<T>[];
  }

  private dbCacheListMap: Record<string, any[]>;
  public getDbCacheList<T extends ArrayElement<typeof this.entities>>(
    constructor: T
  ): InstanceType<T>[] {
    return this.dbCacheListMap[constructor.name] as InstanceType<T>[];
  }

  private getAllEntityList<T extends ArrayElement<typeof this.entities>>(
    constructor: T
  ): InstanceType<T>[] {
    return this.getDbCacheList(constructor).concat(
      this.getTemporaryEntityList(constructor)
    );
  }

  constructor(private dataSource: DataSource) {
    this.dbCacheListMap = {};
    this.temporaryEntityListMap = {};
    Object.values(this.entities).forEach((v) => {
      this.dbCacheListMap[v.name] = [];
      this.temporaryEntityListMap[v.name] = [];
    });
  }

  async clearDatabase(): Promise<void> {
    // Pormise.all 사용하지 말것. 순차적으로 삭제 필요
    for (const entity of [...this.entities].reverse()) {
      await this.dataSource.getRepository(entity).delete({});
    }
    this.resetDbCache();
  }

  async buildDummyData(payload: {
    numUser: number;
    numDeletedUser: number;
    numGroup: number;
    numContent: number;
    numComment: number;
    numLike: number;
  }): Promise<void> {
    for (let i = 0; i < payload.numUser; i++) {
      this.makeDummyUser(false);
    }
    for (let i = 0; i < payload.numDeletedUser; i++) {
      this.makeDummyUser(true);
    }
    for (let i = 0; i < payload.numGroup; i++) {
      this.makeDummyGroup();
    }
    for (let i = 0; i < payload.numContent; i++) {
      await this.makeDummyContent();
    }
    for (let i = 0; i < payload.numComment; i++) {
      this.makeDummyComment();
    }
    for (let i = 0; i < payload.numLike; i++) {
      await this.makeDummyLike();
    }
  }

  async commit(): Promise<void> {
    for (const entity of this.entities) {
      const list = this.getTemporaryEntityList(
        entity
      ) as unknown as TypeormUser[];
      const savedEntities = await this.dataSource
        .getRepository(entity as typeof TypeormUser)
        .save(list);
      this.getDbCacheList(entity).push(...savedEntities);
      this.getTemporaryEntityList(entity).length = 0;
    }
  }

  async load(sourceFilePath: string): Promise<void> {
    CustomAssert.isTrue(
      typeof this.dataSource.options.database === 'string',
      new Error('Database is not a file')
    );
    await this.dataSource.destroy();
    await copyFile(sourceFilePath, this.dataSource.options.database);
    this.dataSource.setOptions({ dropSchema: false });
    await this.dataSource.initialize();

    await this.loadDbCache();
  }

  private async loadDbCache(): Promise<void> {
    this.resetDbCache();
    for (const entity of this.entities) {
      const list = await this.dataSource.getRepository(entity).find();
      this.getDbCacheList(entity).push(...list);
    }
  }

  private resetDbCache(): void {
    this.entities.forEach((entity) => {
      this.getDbCacheList(entity).length = 0;
    });
  }

  makeDummyUser(isDeleted?: boolean): TypeormUser {
    const typeormEntity = new TypeormUser();
    typeormEntity.id = faker.string.uuid() as UserId;
    typeormEntity.username = faker.internet.userName();
    typeormEntity.email = faker.internet.email();

    typeormEntity.hasProfileImage = faker.datatype.boolean();

    typeormEntity.groups = Promise.resolve([]);

    typeormEntity.createdDateTime = faker.date.past();
    typeormEntity.updatedDateTime = getRandomElement([null, faker.date.past()]);
    if (isDeleted === undefined) {
      typeormEntity.deletedDateTime = getRandomElement([
        faker.date.past(),
        null,
      ]);
    } else {
      typeormEntity.deletedDateTime = isDeleted ? faker.date.past() : null;
    }
    this.getTemporaryEntityList(TypeormUser).push(typeormEntity);

    return typeormEntity;
  }

  makeDummyGroup(): TypeormGroup {
    const userList: TypeormUser[] = this.getDbCacheList(TypeormUser).concat(
      this.getTemporaryEntityList(TypeormUser)
    );
    CustomAssert.isTrue(userList.length > 0, new Error('User is empty'));

    const typeormEntity = new TypeormGroup();
    typeormEntity.id = faker.string.uuid() as GroupId;
    typeormEntity.name = faker.internet.userName();

    const owner = getRandomElement(
      userList.filter((user) => !user.deletedDateTime)
    );
    typeormEntity.owner = Promise.resolve(owner);

    const members: TypeormUser[] = [];
    members.push(owner); // owner는 멤버에 포함
    userList
      .filter((user) => !user.deletedDateTime)
      .forEach((user) => {
        const random = getRandomElement([user, null]);
        if (random && !members.includes(random)) {
          members.push(random);
        }
      });
    typeormEntity.members = Promise.resolve(Array.from(members));
    members.forEach((member) => {
      this.makeDummyUserGroupProfile(member.id, typeormEntity.id);
    });

    typeormEntity.createdDateTime = faker.date.past();
    typeormEntity.updatedDateTime = getRandomElement([null, faker.date.past()]);
    typeormEntity.deletedDateTime = getRandomElement([null, faker.date.past()]);

    this.getTemporaryEntityList(TypeormGroup).push(typeormEntity);
    return typeormEntity;
  }

  private makeDummyUserGroupProfile(
    userId: UserId,
    groupId: GroupId
  ): TypeormUserGroupProfile {
    const userGroupProfile = new TypeormUserGroupProfile();
    userGroupProfile.userId = userId;
    userGroupProfile.groupId = groupId;
    userGroupProfile.hasProfileImage = faker.datatype.boolean();
    userGroupProfile.nickname = faker.internet.userName();

    this.getTemporaryEntityList(TypeormUserGroupProfile).push(userGroupProfile);
    return userGroupProfile;
  }

  async makeDummyContent(payload?: {
    type?: ContentTypeEnum;
  }): Promise<TypeormContent> {
    const groupList = this.getDbCacheList(TypeormGroup).concat(
      this.getTemporaryEntityList(TypeormGroup)
    );
    CustomAssert.isTrue(groupList.length > 0, new Error('Group is empty'));

    const group = getRandomElement(groupList);
    const memberList = await group.members;
    CustomAssert.isTrue(memberList.length > 0, new Error('Member is empty'));

    const contentList = this.getDbCacheList(TypeormContent).concat(
      this.getTemporaryEntityList(TypeormContent)
    );
    const groupContentList = contentList.filter(
      async (content) => (await content.group).id === group.id
    );

    const contentType =
      payload?.type || getRandomElement(Object.values(ContentTypeEnum));

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
    instance.id = faker.string.uuid() as ContentId;
    instance.group = Promise.resolve(group);
    instance.owner = Promise.resolve(getRandomElement(memberList));
    instance.contentType = contentType;
    instance.referred = Promise.resolve([]);
    if (groupContentList.length > 0) {
      const num = Math.random() * groupContentList.length;
      const referred: Set<TypeormContent> = new Set();
      for (let i = 0; i < num; i++) {
        referred.add(getRandomElement(groupContentList));
      }
      instance.referred = Promise.resolve(Array.from(referred));
    }
    instance.thumbnailRelativePath = getRandomElement([
      null,
      faker.system.filePath(),
    ]);

    instance.likes = Promise.resolve([]);

    instance.createdDateTime = faker.date.past();
    instance.updatedDateTime = getRandomElement([null, faker.date.past()]);
    instance.deletedDateTime = getRandomElement([null, faker.date.past()]);

    let dates: Date[];
    switch (contentType) {
      case ContentTypeEnum.IMAGE:
        (instance as TypeormMedia).referred = Promise.resolve([]);
        (instance as TypeormMedia).thumbnailRelativePath =
          faker.system.filePath();
        (instance as TypeormMedia).largeRelativePath = getRandomElement([
          null,
          faker.internet.url(),
        ]);

        (instance as TypeormMedia).originalRelativePath = faker.internet.url();
        (instance as TypeormMedia).size = faker.number.int();
        (instance as TypeormMedia).ext = faker.system.commonFileExt();
        (instance as TypeormMedia).mimetype = faker.system.mimeType();
        break;
      case ContentTypeEnum.VIDEO:
        (instance as TypeormMedia).referred = Promise.resolve([]);
        (instance as TypeormMedia).thumbnailRelativePath =
          faker.system.filePath();
        (instance as TypeormMedia).largeRelativePath = null;
        (instance as TypeormMedia).originalRelativePath = faker.internet.url();
        (instance as TypeormMedia).size = faker.number.int();
        (instance as TypeormMedia).ext = faker.system.commonFileExt();
        (instance as TypeormMedia).mimetype = faker.system.mimeType();
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
        (instance as TypeormSchedule).startDateTime = getRandomElement([
          null,
          dates[0]!,
        ]);
        (instance as TypeormSchedule).endDateTime = dates[1]!;
        (instance as TypeormSchedule).isAllDay = getRandomElement([
          false,
          true,
        ]);
        break;
      case ContentTypeEnum.BUCKET:
        (instance as TypeormBucket).title = faker.lorem.sentence();
        (instance as TypeormBucket).status = getRandomElement(
          Object.values(BucketStatusEnum)
        );
        break;

      case ContentTypeEnum.SYSTEM:
        (instance as TypeormSystemContent).text = faker.lorem.sentence();
        (instance as TypeormSystemContent).subText = getRandomElement([
          null,
          faker.lorem.sentence(),
        ]);
        break;
    }

    this.getTemporaryEntityList(TypeormContent).push(instance);
    return instance;
  }

  async makeDummyLike(): Promise<TypeormLike> {
    const contentList = this.getDbCacheList(TypeormContent).concat(
      this.getTemporaryEntityList(TypeormContent)
    );
    const groupList = this.getDbCacheList(TypeormGroup).concat(
      this.getTemporaryEntityList(TypeormGroup)
    );
    CustomAssert.isTrue(contentList.length > 0, new Error('Content is empty'));

    const targetcontent = getRandomElement(contentList);
    CustomAssert.isTrue(!!targetcontent, new Error('Content is empty'));
    const contentGroupId = (await targetcontent.group).id;
    const group = groupList.find((group) => group.id === contentGroupId);
    CustomAssert.isTrue(!!group, new Error('Group was not found'));
    const memberList = await group.members;
    CustomAssert.isTrue(memberList.length > 0, new Error('Member is empty'));

    const typeormLike = new TypeormLike();
    typeormLike.id = faker.string.uuid();
    typeormLike.createdDateTime = faker.date.past();

    typeormLike.content = Promise.resolve(targetcontent);
    typeormLike.user = Promise.resolve(getRandomElement(memberList));

    this.getTemporaryEntityList(TypeormLike).push(typeormLike);
    return typeormLike;
  }

  makeDummyComment(): TypeormComment {
    const contentList = this.getDbCacheList(TypeormContent).concat(
      this.getTemporaryEntityList(TypeormContent)
    );
    const userList = this.getDbCacheList(TypeormUser).concat(
      this.getTemporaryEntityList(TypeormUser)
    );
    CustomAssert.isTrue(
      contentList.length > 0 && userList.length > 0,
      new Error('Content or User is empty')
    );

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

    instance.id = faker.string.uuid() as CommentId;
    instance.commentType = commentType;
    instance.text = faker.lorem.sentence();
    instance.contentId = getRandomElement(contentList).id;

    instance.createdDateTime = faker.date.past();
    instance.updatedDateTime = getRandomElement([null, faker.date.past()]);
    instance.deletedDateTime = getRandomElement([null, faker.date.past()]);

    // let itterNum: number;
    // let tags: Set<TypeormUser>;
    let randomUser: TypeormUser;
    switch (commentType) {
      case CommentTypeEnum.USER_COMMENT:
        randomUser = getRandomElement(userList);
        (instance as TypeormUserComment).owner = Promise.resolve(randomUser);
        (instance as TypeormUserComment).ownerId = randomUser.id;
        // itterNum = Math.random() * userList.length;
        // tags = new Set();
        // for (let i = 0; i < itterNum; i++) {
        //   const randomUser = getRandomElement(userList);
        //   const tag = new TypeormCommentUserTag()
        //   tag.commentId = instance.id;
        //   tag.userId = randomUser.id;
        //   const [numAt] = getRandomIntegers(0,5,1)
        //   const atList = getRandomIntegers(0, instance.text.length-1, numAt!)
        //   tag.at = atList.join(',')
        // }
        // (instance as TypeormUserComment).tags = Promise.resolve(
        //   Array.from(tags),
        // );
        break;
      case CommentTypeEnum.SYSTEM_COMMENT:
        (instance as TypeormSystemComment).subText = getRandomElement([
          null,
          faker.lorem.sentence(),
        ]);
        break;
    }

    this.getTemporaryEntityList(TypeormComment).push(instance);
    return instance;
  }
  // TODO : CommentUserTag dummy 생성 추후 필요 시 구현 할 것
  // makeDummyCommentUserTag(): TypeormCommentUserTag {
  //   const commentList = this.getDbCacheList(TypeormComment).concat(
  //     this.getTemporaryEntityList(TypeormComment),
  //   );
  //   const userList = this.getDbCacheList(TypeormUser).concat(
  //     this.getTemporaryEntityList(TypeormUser),
  //   );
  //   const tag = new TypeormCommentUserTag();
  //   tag.commentId = getRandomElement(commentList).id;
  //   tag.userId = getRandomElement(userList).id;

  //   const itterNum = Math.random() * userList.length;

  //   const [numAt] = getRandomIntegers(0,5,1)
  //   const atList = getRandomIntegers(0, instance.text.length-1, numAt!)
  //   tag.at = atList.join(',')

  //   tag.at = "";
  //   return tag;
  // }
}

function getRandomElement<T>(array: T[]): T {
  CustomAssert.isTrue(array.length > 0, new Error('Array is empty'));
  const randomIndex = Math.floor(Math.random() * array.length);
  return array.at(randomIndex) as T;
}

function getRandomIntegers(min: number, max: number, cnt: number): number[] {
  const list = new Set<number>();
  for (let i = 0; i < cnt; i++) {
    list.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(list);
}

// function getRandomElementList<T>(array: T[], maxNum?: number): T[] {
//   const list = new Set<T>();
//   const cnt = Math.floor(Math.random() * (maxNum || array.length));
//   for (let i = 0; i < cnt; i++) {
//     list.add(getRandomElement(array));
//   }
//   return Array.from(list);
// }
