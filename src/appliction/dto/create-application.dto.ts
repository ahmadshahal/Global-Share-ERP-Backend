import {
    IsArray,
    IsEmail,
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
    @IsArray()
    @IsString({ each: true })
    content: string[];
}

export class CreateApplicationDto {
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    vacancyId: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
