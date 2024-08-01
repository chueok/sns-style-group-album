import { IPasswordEncryptionService } from './password-encryption-service.interface';
import bcrypt from 'bcrypt';

/**
 * 변경 가능성이 낮아, core에 위치시킴
 */

export class DefaultPasswordEncryptionService
  implements IPasswordEncryptionService
{
  constructor(private saltRounds: number) {}

  hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(this.saltRounds, function (err, salt) {
        if (err) {
          reject(err);
        } else {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
              reject(err);
            } else {
              resolve(hash);
            }
          });
        }
      });
    });
  }
  comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hashedPassword, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}
