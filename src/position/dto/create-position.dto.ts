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
    name: string;

    @IsNotEmpty()
    @MinLength(3)
    gsName: string;

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
