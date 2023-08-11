import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSquadDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    gsName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    description: string;
}
