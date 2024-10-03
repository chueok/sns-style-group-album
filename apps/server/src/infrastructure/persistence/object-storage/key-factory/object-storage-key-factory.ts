export class ObjectStorageKeyFactory {
  // user profile
  static getUserProfilePath(userId: string): string {
    return `users/profile/${userId}`;
  }

  // user group profile
  private static getGroupPath(groupId: string): string {
    return `groups/${groupId}`;
  }
  static getUserGroupProfilePath(groupId: string, userId: string): string {
    return `${ObjectStorageKeyFactory.getGroupPath(groupId)}/profile/${userId}`;
  }

  // content default path
  private static getContentPath(groupId: string): string {
    return `${ObjectStorageKeyFactory.getGroupPath(groupId)}/contents`;
  }
  static getThumbnailPath(groupId: string, contentId: string): string {
    return `${this.getContentPath(groupId)}/thumbnail/${contentId}`;
  }
  static getOriginalPath(groupId: string, contentId: string): string {
    return `${this.getContentPath(groupId)}/original/${contentId}`;
  }
  static getLargePath(groupId: string, contentId: string): string {
    return `${this.getContentPath(groupId)}/large/${contentId}`;
  }
}
