import {
  ClassValidationDetails,
  ClassValidator,
} from "../class-validator/class-validator";
import { Code } from "../exception/code";
import { Exception } from "../exception/exception";
import { Optional } from "../type/common-types";

export class UseCaseValidatableAdapter {
  public async validate(): Promise<void> {
    const details: Optional<ClassValidationDetails> =
      await ClassValidator.validate(this);
    if (details) {
      throw Exception.new({
        code: Code.USE_CASE_PORT_VALIDATION_ERROR,
        data: details,
      });
    }
  }
}
