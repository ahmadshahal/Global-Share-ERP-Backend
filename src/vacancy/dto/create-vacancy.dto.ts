import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

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
    @IsInt({ each: true })
    questionsIds: number[];
}
