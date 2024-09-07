import { CreateUserEntityPayload, User } from "@repo/be-core";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";

type ToDomainReturnType = {
  results: User[];
  errors: Error[];
};

export class UserMapper {
  public static async toDomainEntity(
    payload: TypeormUser[],
  ): Promise<ToDomainReturnType> {
    const results: User[] = [];
    const errors: Error[] = [];

    const promiseList = payload.map(async (item) => {
      const userPayload: CreateUserEntityPayload<"existing"> = {
        username: item.username,
        hashedPassword: item.hashedPassword,
        thumbnailRelativePath: item.thumbnailRelativePath,

        id: item.id,
        createdDateTime: item.createdDateTime,
        updatedDateTime: item.updatedDateTime,
        deletedDateTime: item.deletedDateTime,
      };
      return User.new(userPayload);
    });

    await Promise.allSettled(promiseList).then((promiseResults) => {
      promiseResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          errors.push(result.reason);
        }
      });
    });
    return { results, errors };
  }

  public static toOrmEntity(payload: User[]): TypeormUser[] {
    const userList = payload.map((item) => {
      const typeormUser = new TypeormUser();
      typeormUser.id = item.id;
      typeormUser.username = item.username;
      typeormUser.hashedPassword = item.hashedPassword;
      typeormUser.thumbnailRelativePath = item.thumbnailRelativePath;

      typeormUser.createdDateTime = item.createdDateTime;
      typeormUser.updatedDateTime = item.updatedDateTime;
      typeormUser.deletedDateTime = item.deletedDateTime;
      return typeormUser;
    });

    return userList;
  }
}
