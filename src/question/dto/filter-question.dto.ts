import { IsOptional, IsString } from 'class-validator';
import { IsValidQuestionType } from 'src/validators/validate-question-type.validator';

export class FilterQuestionDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsValidQuestionType()
    type: string;
}
