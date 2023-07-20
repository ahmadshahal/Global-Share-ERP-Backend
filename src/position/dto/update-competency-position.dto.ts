import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdatePositionCompetencyDto {
    @IsOptional()
    @IsInt()
    @IsPositive()
    weight?: number;
}
