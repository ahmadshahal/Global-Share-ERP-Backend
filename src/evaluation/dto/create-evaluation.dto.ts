import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEvaluationDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    competencyId: number;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    mark: string;

    @IsNumber()
    @IsNotEmpty()
    evaluatorId: number;

    @IsNotEmpty()
    date: Date;
}
