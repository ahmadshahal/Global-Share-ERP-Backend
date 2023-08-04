import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class CreateQuestionDto {
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsNotEmpty()
    @IsEnum(QuestionType)
    type: QuestionType;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => String)
    options: string[];
}
