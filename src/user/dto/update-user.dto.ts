import { GsLevel, Status } from '@prisma/client';
import {
    IsEmail,
    IsEnum,
    IsMobilePhone,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    firstName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    middleName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    lastName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    arabicFullName: string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    additionalEmail: string;

    @IsOptional()
    @IsNotEmpty()
    @IsMobilePhone()
    phoneNumber: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(150)
    appointlet: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(200)
    bio: string;

    @IsOptional()
    @IsEnum(GsLevel)
    @IsNotEmpty()
    gsLevel: GsLevel;

    @IsOptional()
    @IsEnum(Status)
    @IsNotEmpty()
    status: Status;
}