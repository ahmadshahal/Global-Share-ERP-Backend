import { IsOptional, IsString } from 'class-validator';
import { IsValidLevel } from 'src/validators/validate-level.validator';
import { IsValidStatus } from 'src/validators/validate-gs-status.validator';

export class FilterUserDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsValidStatus()
    status: string;

    @IsOptional()
    @IsValidLevel()
    level: string;

    @IsOptional()
    positions: string;

    @IsOptional()
    squads: string;
}
