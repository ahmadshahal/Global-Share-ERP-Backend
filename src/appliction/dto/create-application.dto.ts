import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
    @IsNotEmpty()
    @IsString()
    questionId: number;

    @IsNotEmpty()
    @IsString()
    text: string;
}

export class CreateApplicationDto {
    @IsNotEmpty()
    @IsString()
    vacancyId: number;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
