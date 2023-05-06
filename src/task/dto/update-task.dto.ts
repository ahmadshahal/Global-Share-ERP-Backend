import { Difficulty, Priority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    title: string;

    @IsOptional()
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

    @IsOptional()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    deadline: Date;

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(Priority)
    priority: Priority;

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(Difficulty)
    difficulty: Difficulty;
}
