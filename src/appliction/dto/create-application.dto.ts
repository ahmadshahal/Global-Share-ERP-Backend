import {
    IsArray,
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AnswerDto {
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    questionId: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => JSON.parse(value))
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
    // @ValidateNested({ each: true })
    // @Type(() => AnswerDto)
    @Transform(({ value }) => JSON.parse(value))
    answers: AnswerDto[];
}
