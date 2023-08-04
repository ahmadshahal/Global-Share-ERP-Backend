import { IsDate, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEvaluationDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsInt()
    @IsNotEmpty()
    competencyId: number;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsNotEmpty()
    @IsString()
    mark: string;

    @IsInt()
    @IsNotEmpty()
    evaluatorId: number;

    @IsDate()
    @IsNotEmpty()
    date: Date;
}
