import {
  ECommentCategory,
  ESystemCommentCategory,
  ISystemContentCommentPort,
  TSystemCommentTag,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormContent } from '../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';
import { TypeormComment } from '../infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';
import { v6 } from 'uuid';
import { TypeormCommentUserTag } from '../infrastructure/persistence/typeorm/entity/commet-user-tag/typeorm-comment-user-tag.entity';

export class SystemContentCommentAdapter implements ISystemContentCommentPort {
  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormCommentRepository: Repository<TypeormComment>;
  private readonly typeormCommentUserTagRepository: Repository<TypeormCommentUserTag>;

  constructor(private readonly dataSource: DataSource) {
    this.typeormContentRepository =
      this.dataSource.getRepository(TypeormContent);
    this.typeormCommentRepository =
      this.dataSource.getRepository(TypeormComment);

    this.typeormCommentUserTagRepository = this.dataSource.getRepository(
      TypeormCommentUserTag
    );
  }

  addContent(payload: {
    groupId: string;
    refContentIds: string[];
  }): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async addComment(payload: {
    groupId: string;
    category: ESystemCommentCategory;
    text: string;
    tags: TSystemCommentTag[];
  }): Promise<void> {
    const newComment = this.typeormCommentRepository.create({
      id: v6(),
      commentCategory: ECommentCategory.SYSTEM_COMMENT,
      groupId: payload.groupId,
      text: payload.text,
      createdDateTime: new Date(),
      systemCommentCategory: payload.category,
    });

    const savedComment = await this.typeormCommentRepository.save(newComment);

    const tags = payload.tags.map((tag) => {
      return this.typeormCommentUserTagRepository.create({
        commentId: savedComment.id,
        memberId: tag.memberId,
        at: tag.at.join(','),
      });
    });

    await this.typeormCommentUserTagRepository.save(tags);
  }
}
