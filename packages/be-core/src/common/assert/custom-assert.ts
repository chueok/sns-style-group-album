import { Nullable, Optional } from '../type/common-types';

export class CustomAssert {
  public static isTrue(
    expression: boolean,
    exception: Error
  ): asserts expression {
    if (!expression) {
      throw exception;
    }
  }

  public static isFalse(
    expression: boolean,
    exception: Error
  ): asserts expression {
    if (expression) {
      throw exception;
    }
  }

  public static notEmpty<T>(value: Optional<Nullable<T>>, exception: Error): T {
    if (value === null || value === undefined) {
      throw exception;
    }
    return value;
  }
}
