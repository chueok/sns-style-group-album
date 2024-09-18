import { get } from "env-var";

export class ServerConfig {
  public static readonly NODE_ENV = get("NODE_ENV")
    .required()
    .asEnum(["development", "production", "test"]);

  public static readonly DB_FILE = get("DB_FILE").required().asString();

  public static readonly DB_LOG_ENABLE = get("DB_LOG_ENABLE")
    .required()
    .asBool();

  public static readonly OAUTH_GOOGLE_ID = get("OAUTH_GOOGLE_ID")
    .required()
    .asString();
  public static readonly OAUTH_GOOGLE_SECRET = get("OAUTH_GOOGLE_SECRET")
    .required()
    .asString();
  public static readonly OAUTH_GOOGLE_REDIRECT = get("OAUTH_GOOGLE_REDIRECT")
    .required()
    .asString();

  public static readonly JWT_SECRET = get("JWT_SECRET").required().asString();
}
