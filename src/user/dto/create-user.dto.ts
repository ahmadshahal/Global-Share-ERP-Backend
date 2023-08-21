import { GsStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsMobilePhone,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

class PositionDto {
    @IsInt()
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
    @IsNotEmpty()
    @MinLength(3)
    firstName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    middleName: string;

    @IsNotEmpty()
    @MinLength(3)
    lastName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    arabicFullName: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    @IsInt()
    roleId: number;

    @IsNotEmpty()
    @IsEmail()
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
    appointlet: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
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
