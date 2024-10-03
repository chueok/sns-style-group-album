export class DiTokens {
  // repository
  static readonly UserRepository = Symbol("UserRepository");
  static readonly GroupRepository = Symbol("GroupRepository");
  static readonly ContentRepository = Symbol("ContentRepository");
  static readonly CommentRepository = Symbol("CommentRepository");

  // service
  static readonly AuthService = Symbol("AuthService");

  // user usecase
  static readonly GetUserUsecase = Symbol("GetUserUsecase");
  static readonly GetGroupMemberUsecase = Symbol("GetGroupMemberUsecase");
  static readonly DeleteUserUsecase = Symbol("DeleteUserUsecase");
  static readonly EditUserUsecase = Symbol("EditUserUsecase");
  static readonly EditUserGroupProfileUsecase = Symbol(
    "EditUserGroupProfileUsecase",
  );

  // group usecase
  static readonly GetGroupUsecase = Symbol("GetGroupUsecase");
  static readonly GetGroupListUsecase = Symbol("GetGroupListUsecase");
  static readonly GetOwnGroupListUsecase = Symbol("GetOwnGroupListUsecase");
  static readonly EditGroupUsecase = Symbol("EditGroupUsecase");
  static readonly InviteUserUsecase = Symbol("InviteUserUsecase");
  static readonly CreateGroupUsecase = Symbol("CreateGroupUsecase");
  static readonly DeleteGroupUsecase = Symbol("DeleteGroupUsecase");
  static readonly AcceptInvitationUsecase = Symbol("AcceptInvitationUsecase");

  // content usecase
  static readonly GetMediaContentListUsecase = Symbol(
    "GetMediaContentListUsecase",
  );

  // storage
  static readonly ObjectStorageFactory = Symbol("ObjectStorageFactory");
  static readonly MediaObjectStorage = Symbol("MediaObjectStorage");
}
