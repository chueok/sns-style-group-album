export class DiTokens {
  // repository
  static readonly UserRepository = Symbol("UserRepository");
  static readonly GroupRepository = Symbol("GroupRepository");
  static readonly ContentRepository = Symbol("ContentRepository");
  static readonly CommentRepository = Symbol("CommentRepository");

  // service
  static readonly AuthService = Symbol("AuthService");

  // usecase
  static readonly GetUserUsecase = Symbol("GetUserUsecase");
  static readonly GetGroupMemberUsecase = Symbol("GetGroupMemberUsecase");
  static readonly DeleteUserUsecase = Symbol("DeleteUserUsecase");
  static readonly ObjectStorageFactory = Symbol("ObjectStorageFactory");
  static readonly MediaObjectStorage = Symbol("MediaObjectStorage");
}
