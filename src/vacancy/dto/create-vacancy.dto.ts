import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateVacancyDto {
    @IsNotEmpty()
    @IsString()
    effect: string;

    @IsNotEmpty()
    @IsString()
    brief: string;

    @IsNotEmpty()
    @IsString()
    tasks: string;

    @IsNotEmpty()
    @IsString()
    required: string;

    @IsOptional()
    @IsString()
    preferred: string;

    @IsNotEmpty()
    @IsInt()
    positionId: number;

    @IsOptional()
    @IsNotEmpty()
    @IsBoolean()
    isOpen: boolean;

    @IsNotEmpty()
    @IsArray()
    @IsInt({ each: true })
    questionsIds: number[];
}
