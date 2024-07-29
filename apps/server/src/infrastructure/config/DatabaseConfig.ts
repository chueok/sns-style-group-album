import { get } from 'env-var';

export class DatabaseConfig {
  public static readonly DB_FILE: string = get('DB_FILE').required().asString();

  public static readonly DB_LOG_ENABLE: boolean = get('DB_LOG_ENABLE')
    .required()
    .asBool();
}
