import { join, basename } from 'path';
import { DataSource } from 'typeorm';
import { DummyDatabaseHandler } from '@test-utils/persistence/dummy-database-handler';
import { TypeormCommentRepository } from './comment-repository';
import { TypeormComment } from '../../entity/comment/typeorm-comment.entity';
import { CommentMapper } from './mapper/comment-mapper';
import { TypeormContent } from '../../entity/content/typeorm-content.entity';
import { Comment, CommentId, CommentUserTag, GroupId } from '@repo/be-core';
import { TypeormUser } from '../../entity/user/typeorm-user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from '../../../../../di/infrastructure.module';

const parameters = {
  testDbPath: join('db', `${basename(__filename)}.sqlite`),
  dummyDbPath: join('db', 'dummy.sqlite'),
};

describe('CommentRepository', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  let commentRepository: TypeormCommentRepository;
  let targetOrmComment: TypeormComment;

  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });
    await testDataSource.initialize();

    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();
    dataSource = module.get<DataSource>(DataSource);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);
    await testDatabaseHandler.load(parameters.dummyDbPath);
    targetOrmComment = testDatabaseHandler
      .getDbCacheList(TypeormComment)
      .at(-1)!;

    commentRepository = new TypeormCommentRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe('findCommentById', () => {
    it('should find a comment by id', async () => {
      const comment = await commentRepository.findCommentById(
        targetOrmComment.id
      );
      expect(comment).not.toBeNull();
      expect(comment!.id).toEqual(targetOrmComment.id);
    });

    it('should not find a comment by id when an error occurs', async () => {
      const comment = await commentRepository.findCommentById(
        'invalid-id' as CommentId
      );
      expect(comment).toBeNull();
    });
  });

  describe('findCommentListByContentId', () => {
    it('should find a comment list by content id', async () => {
      const commentList = await commentRepository.findCommentListByContentId({
        contentId: targetOrmComment.contentId,
        page: 1,
        pageSize: 3,
      });
      expect(commentList.length).toBeGreaterThan(0);
      expect(commentList.length).toBeLessThanOrEqual(3);
      commentList.forEach((comment) => {
        expect(comment.contentId).toEqual(targetOrmComment.contentId);
      });
    });

    it('should not find a comment list by content id when an error occurs', async () => {
      const commentList = await commentRepository.findCommentListByContentId({
        contentId: 'invalid-id',
        page: 1,
        pageSize: 3,
      });
      expect(commentList.length).toEqual(0);
    });
  });

  describe('findCommentListForFeed', () => {
    let groupId: GroupId;
    let cursor: Date;
    beforeAll(async () => {
      const content = await targetOrmComment.content;
      groupId = content.groupId;
      const commentListOfGroup = await commentRepository.findCommentListForFeed(
        {
          groupId,
          pagination: {
            by: 'createdDateTime',
            direction: 'asc',
            limit: 5,
          },
        }
      );

      cursor = commentListOfGroup.at(
        Math.floor(commentListOfGroup.length / 2)
      )!.createdDateTime;
    });

    it('should be defined', () => {
      expect(groupId).toBeDefined();
      expect(cursor).toBeDefined();
    });

    it('[desc] should find a comment list for feed', async () => {
      const commentList = await commentRepository.findCommentListForFeed({
        groupId,
        pagination: {
          cursor,
          by: 'createdDateTime',
          direction: 'desc',
          limit: 3,
        },
      });
      expect(commentList.length).toBeGreaterThan(0);
      expect(commentList.length).toBeLessThanOrEqual(3);

      for (let i = 1; i < commentList.length; i++) {
        expect(commentList[i]!.createdDateTime.getTime()).toBeLessThanOrEqual(
          commentList[i - 1]!.createdDateTime.getTime()
        );
      }
    });

    it('[asc] should find a comment list for feed', async () => {
      const commentList = await commentRepository.findCommentListForFeed({
        groupId,
        pagination: {
          cursor,
          by: 'createdDateTime',
          direction: 'asc',
          limit: 5,
        },
      });
      expect(commentList.length).toBeGreaterThan(0);
      expect(commentList.length).toBeLessThanOrEqual(5);

      for (let i = 1; i < commentList.length; i++) {
        expect(
          commentList[i]!.createdDateTime.getTime()
        ).toBeGreaterThanOrEqual(commentList[i - 1]!.createdDateTime.getTime());
      }
    });

    it('should not find a comment list for feed when an error occurs', async () => {
      const commentList = await commentRepository.findCommentListForFeed({
        groupId: 'invalid-id',
        pagination: {
          cursor: targetOrmComment.createdDateTime,
          by: 'createdDateTime',
          direction: 'asc',
          limit: 5,
        },
      });

      expect(commentList.length).toEqual(0);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const ormDummyComment = testDatabaseHandler
        .getDbCacheList(TypeormComment)
        .at(-1)!;

      const content = (await dataSource
        .getRepository(TypeormContent)
        .findOneBy({ id: ormDummyComment.contentId }))!;
      expect(content).not.toBeNull();

      const mapResult = await CommentMapper.toDomainEntity({
        elements: [
          {
            comment: ormDummyComment,
            tags: await ormDummyComment.tags,
          },
        ],
      });

      const domainDummyComment = mapResult.results[0]!;

      expect(domainDummyComment).not.toBeNull();

      const result = await commentRepository.createComment(domainDummyComment);
      expect(result).toBeTruthy();
    });

    it('should not create a comment when an error occurs', async () => {
      const ormDummyComment = testDatabaseHandler
        .getDbCacheList(TypeormComment)
        .at(-1)!;

      const content = (await dataSource
        .getRepository(TypeormContent)
        .findOneBy({ id: ormDummyComment.contentId }))!;
      expect(content).not.toBeNull();

      const mapResult = (await CommentMapper.toDomainEntity({
        elements: [
          {
            comment: ormDummyComment,
            tags: await ormDummyComment.tags,
          },
        ],
      }))!;

      if (mapResult.errors.length > 0) {
        console.log(mapResult.errors);
      }
      const domainDummyComment = mapResult.results[0]!;

      expect(domainDummyComment).not.toBeNull();

      (domainDummyComment as any)._createdDateTime = null;
      const result = await commentRepository.createComment(domainDummyComment);
      expect(result).toBeFalsy();
    });
  });
});
