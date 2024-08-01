import { DefaultPasswordEncryptionService } from './default-password-encryption-service';

describe('DefaultPasswordEncryptionService', () => {
  let passwordEncryptionService: DefaultPasswordEncryptionService;

  beforeEach(() => {
    passwordEncryptionService = new DefaultPasswordEncryptionService(10);
  });

  describe('hash', () => {
    it('should hash the password', async () => {
      const password = 'password123';
      const hashedPassword = await passwordEncryptionService.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password123';
      const hashedPassword = await passwordEncryptionService.hash(password);
      const result = await passwordEncryptionService.comparePassword(
        password,
        hashedPassword
      );

      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await passwordEncryptionService.hash(password);
      const result = await passwordEncryptionService.comparePassword(
        wrongPassword,
        hashedPassword
      );

      expect(result).toBe(false);
    });
  });
});
