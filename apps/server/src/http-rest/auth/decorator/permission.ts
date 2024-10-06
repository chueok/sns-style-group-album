import { Reflector } from "@nestjs/core";

/**
 * 1. jwt를 통해 user 확인
 * 2. group owner 확인
 * 3. group member 확인
 * 4. content owner인지 확인
 */
export enum PermissionEnum {
  USER = "USER", // 1
  GROUP_OWNER = "GROUP_OWNER", // 1, 2
  GROUP_MEMBER = "GROUP_MEMBER", // 1, 3
  CONTENT_OWNER = "CONTENT_OWNER", // 1, 3, 4
}

export const Permission = Reflector.createDecorator<PermissionEnum>();
