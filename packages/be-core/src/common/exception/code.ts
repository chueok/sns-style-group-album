export type CodeDescription = {
  code: number;
  message: string;
};

export class Code {
  // Common

  public static SUCCESS: CodeDescription = {
    code: 200,
    message: 'Success.',
  };

  public static BAD_REQUEST_ERROR: CodeDescription = {
    code: 400,
    message: 'Bad request.',
  };

  public static UNAUTHORIZED_ERROR: CodeDescription = {
    code: 401,
    message: 'Unauthorized error.',
  };

  public static WRONG_CREDENTIALS_ERROR: CodeDescription = {
    code: 402,
    message: 'Wrong Credentials.',
  };

  public static ACCESS_DENIED_ERROR: CodeDescription = {
    code: 403,
    message: 'Access denied.',
  };

  public static INTERNAL_ERROR: CodeDescription = {
    code: 500,
    message: 'Internal error.',
  };

  //

  public static UTIL_VALIDATION_ERROR: CodeDescription = {
    code: 1000,
    message: 'Class validation error.',
  };

  public static UTIL_PARAM_TYPE_ERROR: CodeDescription = {
    code: 1001,
    message: 'Parameter type error.',
  };

  public static UTIL_ALREADY_EXISTS_ERROR: CodeDescription = {
    code: 1002,
    message: 'Already exists.',
  };

  public static UTIL_NOT_FOUND_ERROR: CodeDescription = {
    code: 1003,
    message: 'Not found.',
  };

  public static ENTITY_NOT_FOUND_ERROR: CodeDescription = {
    code: 2000,
    message: 'Entity not found.',
  };

  public static ENTITY_VALIDATION_ERROR: CodeDescription = {
    code: 2001,
    message: 'Entity validation error.',
  };

  public static ENTITY_ALREADY_EXISTS_ERROR: CodeDescription = {
    code: 2004,
    message: 'Entity already exists.',
  };

  public static VALUE_OBJECT_VALIDATION_ERROR: CodeDescription = {
    code: 3000,
    message: 'Value object validation error.',
  };
  public static PROPERTY_NOT_DEFINED_ERROR: CodeDescription = {
    code: 3001,
    message: 'Property not defined error.',
  };
}
