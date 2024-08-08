export interface IPasswordEncryptionService {
  hash(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
