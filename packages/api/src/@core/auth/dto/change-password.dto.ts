import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    old_password_hash: string;

    @IsString()
    @MinLength(9, { message: 'New password must be at least 9 characters long' })
    new_password_hash: string;
}