import { QuestionType } from '@prisma/client';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsNotEmpty()
    @IsEnum(QuestionType)
    type: QuestionType;
}
