import {
    IsEmail,
    IsInt,
    IsMobilePhone,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class SignupDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    firstName: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(64)
    password: string;

    @IsNotEmpty()
    @IsMobilePhone()
    phoneNumber: string;

    @IsNotEmpty()
    @IsInt()
    roleId: number;
}
