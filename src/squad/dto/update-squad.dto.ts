import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateSquadDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;
}
