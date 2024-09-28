import { UseCaseValidatableAdapter } from "@repo/be-core";
import { IsString } from "class-validator";

export interface ISignupPort {
  signupToken: string;
  username: string;
  email: string;
}

export class SignupAdaptor
  extends UseCaseValidatableAdapter
  implements ISignupPort
{
  @IsString()
  signupToken!: string;

  @IsString()
  username!: string;

  @IsString()
  email!: string;

  static async new(payload: ISignupPort): Promise<ISignupPort> {
    const adapter = new SignupAdaptor();
    adapter.signupToken = payload.signupToken;
    adapter.username = payload.username;
    adapter.email = payload.email;
    await adapter.validate();
    return adapter;
  }
}
