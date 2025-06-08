import { CommentService, ICommentRepository } from '@repo/be-core';
import { Module, Provider } from '@nestjs/common';
import { DiTokens } from './di-tokens';
import { TypeormCommentRepository } from './comment-repository';

const providers: Provider[] = [
  {
    provide: DiTokens.CommentRepository,
    useClass: TypeormCommentRepository,
  },
  {
    provide: CommentService,
    useFactory: (commentRepository: ICommentRepository) => {
      return new CommentService(commentRepository);
    },
    inject: [DiTokens.CommentRepository],
  },
];

@Module({
  providers: [...providers],
  exports: [CommentService, DiTokens.CommentRepository],
})
export class CommentModule {}
