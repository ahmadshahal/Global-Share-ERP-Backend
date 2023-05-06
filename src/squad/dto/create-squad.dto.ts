import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateSquadDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    gsName: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    description: string;
}
