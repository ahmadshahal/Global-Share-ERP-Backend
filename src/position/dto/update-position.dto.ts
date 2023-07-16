import { GsLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdatePositionDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    gsName: string;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    weeklyHours: number;

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(GsLevel)
    gsLevel: GsLevel;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    squadId: number;
}
