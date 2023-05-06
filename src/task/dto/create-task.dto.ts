import { Difficulty, Priority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    description: string;

    @IsOptional()
    @IsNotEmpty()
    @IsUrl()
    @MinLength(3)
    @MaxLength(50)
    url: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    deadline: Date;

    @IsNotEmpty()
    @IsEnum(Priority)
    priority: Priority;

    @IsNotEmpty()
    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    squadId: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    statusId: number;
}
