import { Module, Provider } from "@nestjs/common";
import { InfrastructureModule } from "./infrastructure.module";
import { DiTokens } from "./di-tokens";
import { TypeormCommentRepository } from "../infrastructure/persistence/typeorm/repository/comment/comment-repository";
import { CommentController } from "../http-rest/controller/comment-controller";

const persistenceProviders: Provider[] = [
  {
    provide: DiTokens.CommentRepository,
    useClass: TypeormCommentRepository,
  },
];

@Module({
  imports: [InfrastructureModule],
  controllers: [CommentController],
  providers: [...persistenceProviders],
  exports: [DiTokens.CommentRepository],
})
export class CommentModule {}
