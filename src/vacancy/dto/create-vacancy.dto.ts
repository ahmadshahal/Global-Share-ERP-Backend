import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateVacancyDto {
    @IsNotEmpty()
    effect: string;

    @IsNotEmpty()
    brief: string;

    @IsNotEmpty()
    tasks: string;

    @IsNotEmpty()
    required: string;

    @IsOptional()
    preferred: string;

    @IsNotEmpty()
    @IsInt()
    positionId: number;

    
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Number)
    questionsIds: number[];
}
