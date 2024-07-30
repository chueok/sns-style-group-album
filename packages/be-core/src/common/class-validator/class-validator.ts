import { validate, ValidationError } from 'class-validator';
import { Optional } from '../type/common-types';
import { Exception } from '../exception/exception';
import { Code } from '../exception/code';

export type ClassValidationErrors = {
  property: string;
  message: string[];
};

export type ClassValidationDetails = {
  context: string;
  errors: ClassValidationErrors[];
};

export class ClassValidator {
  public static async validate<TTarget extends object>(
    target: TTarget,
    context?: string
  ): Promise<Optional<ClassValidationDetails>> {
    let details: Optional<ClassValidationDetails>;
    const errors: ValidationError[] = await validate(target);

    if (errors.length > 0) {
      details = {
        context: context || target.constructor.name,
        errors: [],
      };
      for (const error of errors) {
        details.errors.push({
          property: error.property,
          message: error.constraints ? Object.values(error.constraints) : [],
        });
      }
    }

    return details;
  }

  public static async validateOrThrow<TTarget extends object>(
    target: TTarget,
    context?: string
  ): Promise<void> {
    const details = await this.validate(target, context);
    if (details) {
      throw Exception.new({
        code: Code.UTIL_VALIDATION_ERROR,
        data: details,
      });
    }
  }
}
