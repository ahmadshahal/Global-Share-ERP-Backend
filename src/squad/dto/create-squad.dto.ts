import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSquadDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    gsName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    description: string;
}
