import { IsInt, IsNotEmpty } from 'class-validator';

export class AddQuestionToVacancyDto {
    @IsInt()
    @IsNotEmpty()
    questionId: number;
}
