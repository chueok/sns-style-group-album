import { get } from "env-var";

export class ServerConfig {
  public static readonly DB_FILE: string = get("DB_FILE").required().asString();

  public static readonly DB_LOG_ENABLE: boolean = get("DB_LOG_ENABLE")
    .required()
    .asBool();

  public static readonly OAUTH_GOOGLE_ID: string = get("OAUTH_GOOGLE_ID")
    .required()
    .asString();
  public static readonly OAUTH_GOOGLE_SECRET: string = get("OAUTH_GOOGLE_ID")
    .required()
    .asString();
  public static readonly OAUTH_GOOGLE_REDIRECT: string = get("OAUTH_GOOGLE_ID")
    .required()
    .asString();
}
