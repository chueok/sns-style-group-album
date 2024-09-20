export class DiTokens {
  // repository
  static readonly UserRepository = Symbol("UserRepository");
  static readonly GroupRepository = Symbol("GroupRepository");
  static readonly ContentRepository = Symbol("ContentRepository");
  static readonly CommentRepository = Symbol("CommentRepository");

  // service
  static readonly AuthService = Symbol("AuthService");
}
