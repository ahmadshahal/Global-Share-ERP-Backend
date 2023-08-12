import { IsOptional, IsString } from 'class-validator';
import { IsValidLevel } from 'src/validators/validate-level.validator';

export class FilterPositionDto {
    @IsOptional()
    squads: string;

    @IsOptional()
    @IsValidLevel()
    level: string;

    @IsOptional()
    @IsString()
    search: string;
}
