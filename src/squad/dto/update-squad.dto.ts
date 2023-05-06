import { IsNotEmpty, IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateSquadDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    gsName: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    description: string;
}
