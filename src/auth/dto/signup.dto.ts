import {
    IsEmail,
    IsMobilePhone,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class SignupDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    firstName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    middleName: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    lastName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    arabicFullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    additionalEmail: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(64)
    password: string;

    @IsNotEmpty()
    @IsMobilePhone()
    phoneNumber: string;
}
