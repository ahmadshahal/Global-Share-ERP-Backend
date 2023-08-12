import { GsStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsEmail,
    IsEnum,
    IsMobilePhone,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

class PositionDto {
    @IsNotEmpty()
    positionId: number;

    @IsOptional()
    @IsDate()
    startDate: Date;

    @IsOptional()
    @IsDate()
    endDate: Date;
}

export class CreateUserDto {
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
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    roleId: number;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    email: string;

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
    @IsEnum(GsStatus)
    @IsNotEmpty()
    gsStatus: GsStatus;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PositionDto)
    positions: PositionDto[];
}
