import {
    IsArray,
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
}

export class CreateApplicationDto {
    @IsNotEmpty()
    vacancyId: number;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
