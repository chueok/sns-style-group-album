import { ServerConfig } from "../../../../config/server-config";

export class MinioPolicy {
  static PUBLIC_BUCKET = {
    Id: "PublicGetObjectPolicy",
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicGetObjectStatement",
        Action: ["s3:GetObject"],
        Effect: "Allow",
        Resource: `arn:aws:s3:::${ServerConfig.OBJECT_STORAGE_PUBLIC_BUCKET}/*`,
        Principal: {
          AWS: ["s3:GetObject"],
        },
      },
    ],
  };
}
