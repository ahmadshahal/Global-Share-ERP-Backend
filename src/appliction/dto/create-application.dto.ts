import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
    @IsNotEmpty()
    questionId: number;

    @IsOptional()
    @IsString()
    text: string;

    @IsOptional()
    file: any;
}

export class CreateApplicationDto {
    @IsNotEmpty()
    vacancyId: number;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
