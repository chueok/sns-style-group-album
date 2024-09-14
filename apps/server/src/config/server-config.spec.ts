import { ServerConfig } from "./server-config";

describe(`${ServerConfig.name}`, () => {
  describe("DB_FILE", () => {
    it("should return the value of DB_FILE from environment variables", () => {
      const result = ServerConfig.DB_FILE;
      expect(result).toBe("test.sqlite");
    });
  });

  describe("DB_LOG_ENABLE", () => {
    it("should return the value of DB_LOG_ENABLE from environment variables", () => {
      const result = ServerConfig.DB_LOG_ENABLE;
      expect(typeof result).toBe("boolean");
    });
  });
});
