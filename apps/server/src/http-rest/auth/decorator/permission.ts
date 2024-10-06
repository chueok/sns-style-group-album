import { Reflector } from "@nestjs/core";

/**
 * 1. jwt를 통해 user 확인
 * 2. group owner 확인 - 'groupId' parameter required
 * 3. group member 확인 - 'groupId' parameter required
 * 4. content owner인지 확인 - 'groupId' and 'contentId' parameter required
 */
export enum PermissionEnum {
  USER = "USER",
  GROUP_OWNER = "GROUP_OWNER",
  GROUP_MEMBER = "GROUP_MEMBER",
  CONTENT_OWNER = "CONTENT_OWNER",
  COMMENT_OWNER = "COMMENT_OWNER",
}

export const Permission = Reflector.createDecorator<PermissionEnum>();
