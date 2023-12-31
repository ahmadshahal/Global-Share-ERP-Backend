import { Difficulty, Priority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

class TaskKpiDto {
    @IsNotEmpty()
    @IsInt()
    kpiId: number;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    description?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    grade?: number;
}

export class CreateTaskDto {
    @IsNotEmpty()
    @MinLength(3)
    title: string;

    @IsNotEmpty()
    @MinLength(3)
    description: string;

    @IsOptional()
    @IsUrl()
    url?: string;

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
    statusId: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    assignedToId: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TaskKpiDto)
    kpis: TaskKpiDto[];

    @IsNotEmpty()
    @IsNumber()
    assignedById: number;

    @IsOptional()
    @IsNumber()
    stepId?: number;
}
