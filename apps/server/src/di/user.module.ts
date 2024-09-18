import { Module, Provider } from "@nestjs/common";
import { InfrastructureModule } from "./infrastructure.module";
import { DiTokens } from "./di-tokens";
import { TypeormUserRepository } from "../infrastructure/persistence/typeorm/repository/user/user-repository";

const persistenceProviders: Provider[] = [
  {
    provide: DiTokens.UserRepository,
    useClass: TypeormUserRepository,
  },
];

@Module({
  imports: [InfrastructureModule],
  controllers: [],
  providers: [...persistenceProviders],
  exports: [DiTokens.UserRepository],
})
export class UserModule {}
