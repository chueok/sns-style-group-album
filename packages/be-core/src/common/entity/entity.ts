import {
  ClassValidationDetails,
  ClassValidator,
} from "../class-validator/class-validator";
import { Code } from "../exception/code";
import { Exception } from "../exception/exception";
import { Optional } from "../type/common-types";

export abstract class Entity<TIdentifier extends string | number> {
  protected _id: Optional<TIdentifier>;

  public get id(): TIdentifier {
    if (typeof this._id === "undefined") {
      throw Exception.new({
        code: Code.ENTITY_VALIDATION_ERROR,
        overrideMessage: `${this.constructor.name}: ID is empty.`,
      });
    }

    return this._id;
  }

  public async validate(): Promise<void> {
    const details: Optional<ClassValidationDetails> =
      await ClassValidator.validate(this);

    if (details) {
      throw Exception.new({
        code: Code.ENTITY_VALIDATION_ERROR,
        data: details,
      });
    }
  }
}
