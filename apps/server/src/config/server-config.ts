import { get } from 'env-var';

export class ServerConfig {
  public static readonly NODE_ENV = get('NODE_ENV')
    .required()
    .asEnum(['development', 'production', 'test']);

  public static readonly isProduction = ServerConfig.NODE_ENV === 'production';

  public static readonly DB_FILE = get('DB_FILE').required().asString();

  public static readonly DB_LOG_ENABLE = get('DB_LOG_ENABLE')
    .required()
    .asBool();

  public static readonly OAUTH_GOOGLE_ID = get('OAUTH_GOOGLE_ID')
    .required()
    .asString();
  public static readonly OAUTH_GOOGLE_SECRET = get('OAUTH_GOOGLE_SECRET')
    .required()
    .asString();
  public static readonly OAUTH_GOOGLE_REDIRECT = get('OAUTH_GOOGLE_REDIRECT')
    .required()
    .asString();

  public static readonly JWT_SECRET = get('JWT_SECRET').required().asString();

  public static readonly OBJECT_STORAGE_ENDPOINT = get(
    'OBJECT_STORAGE_ENDPOINT'
  )
    .required()
    .asString();
  public static readonly OBJECT_STORAGE_PORT = get('OBJECT_STORAGE_PORT')
    .required()
    .asPortNumber();
  public static readonly OBJECT_STORAGE_ACCESS_KEY = get(
    'OBJECT_STORAGE_ACCESS_KEY'
  )
    .required()
    .asString();
  public static readonly OBJECT_STORAGE_SECRET_KEY = get(
    'OBJECT_STORAGE_SECRET_KEY'
  )
    .required()
    .asString();
  public static readonly OBJECT_STORAGE_USE_SSL = get('OBJECT_STORAGE_USE_SSL')
    .required()
    .asBool();
  public static readonly OBJECT_STORAGE_BASE_PATH = get(
    'OBJECT_STORAGE_BASE_PATH'
  )
    .required()
    .asString();
  public static readonly OBJECT_STORAGE_MEDIA_BUCKET = get(
    'OBJECT_STORAGE_MEDIA_BUCKET'
  )
    .required()
    .asString();
  public static readonly OBJECT_STORAGE_PUBLIC_BUCKET = get(
    'OBJECT_STORAGE_PUBLIC_BUCKET'
  )
    .required()
    .asString();

  public static readonly OBJECT_STORAGE_WEB_HOOK_AUTH = get(
    'OBJECT_STORAGE_WEB_HOOK_AUTH'
  )
    .required()
    .asString();

  public static readonly CLIENT_ENDPOINT = get('CLIENT_ENDPOINT')
    .required()
    .asString();
}
