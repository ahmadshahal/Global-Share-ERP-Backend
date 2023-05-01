import { GsLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreatePositionDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    gsName: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    jobDescription: string;

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    weeklyHours: number;

    @IsNotEmpty()
    @IsEnum(GsLevel)
    gsLevel: GsLevel;

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    squadId: number;
}
