// NOTE : 현재 사용중이지 않음.
export interface IPasswordEncryptionService {
  hash(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
