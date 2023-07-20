import { IsInt, IsPositive } from 'class-validator';

export class AddCompetencyToPositionDto {
    @IsInt()
    @IsPositive()
    weight: number;

    @IsInt()
    @IsPositive()
    competencyId: number;

    @IsInt()
    @IsPositive()
    positionId: number;
}
