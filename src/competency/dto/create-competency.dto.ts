import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateCompetencyDto {
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsNotEmpty()
    @MinLength(3)
    description: string;
}
