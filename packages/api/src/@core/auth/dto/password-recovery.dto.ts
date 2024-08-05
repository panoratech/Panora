import { IsEmail } from 'class-validator';

export class PasswordRecoveryDto {
  @IsEmail()
  email: string;
}
