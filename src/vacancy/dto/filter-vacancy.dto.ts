import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterVacancyDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    positions: string;

    @IsOptional()
    squads: string;

    @IsOptional()
    @IsNumber()
    isOpen: number;
}
