import { CreateUserEntityPayload, Nullable, User } from "@repo/be-core";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";

export class UserMapper {
  public static toDomainEntity(payload: TypeormUser): Promise<Nullable<User>>;
  public static toDomainEntity(payload: TypeormUser[]): Promise<User[]>;
  public static async toDomainEntity(
    payload: TypeormUser | TypeormUser[],
  ): Promise<Nullable<User> | User[]> {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const promises = payloadList.map(async (item) => {
      const userPayload: CreateUserEntityPayload<"existing"> = {
        username: item.username,
        hashedPassword: item.hashedPassword,
        thumbnailRelativePath: item.thumbnailRelativePath,

        id: item.id,
        createdDateTime: item.createdDateTime,
        updatedDateTime: item.updatedDateTime,
        deletedDateTime: item.deletedDateTime,
      };
      return User.new(userPayload).catch((error) => {
        console.log(error.data.errors);
        return null;
      });
    });
    const domainEntities = (await Promise.all(promises)).filter(
      (item) => item !== null,
    );

    if (Array.isArray(payload)) {
      return domainEntities;
    } else {
      return domainEntities[0] || null;
    }
  }

  public static toOrmEntity(payload: User): TypeormUser;
  public static toOrmEntity(payload: User[]): TypeormUser[];
  public static toOrmEntity(
    payload: User | User[],
  ): TypeormUser | TypeormUser[] {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const userList = payloadList.map((item) => {
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

    if (Array.isArray(payload)) {
      return userList;
    } else {
      return userList[0]!;
    }
  }
}
