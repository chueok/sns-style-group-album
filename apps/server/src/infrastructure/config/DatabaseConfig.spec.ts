import { DatabaseConfig } from "./DatabaseConfig";

describe("DatabaseConfig", () => {
  describe("DB_FILE", () => {
    it("should return the value of DB_FILE from environment variables", () => {
      const result = DatabaseConfig.DB_FILE;
      expect(result).toBe("test.sqlite");
    });
  });

  describe("DB_LOG_ENABLE", () => {
    it("should return the value of DB_LOG_ENABLE from environment variables", () => {
      const result = DatabaseConfig.DB_LOG_ENABLE;
      expect(typeof result).toBe("boolean");
    });
  });
});
