import { IsOptional, IsString } from 'class-validator';
import { IsValidRecruitmentStatus } from 'src/validators/validate-recruitment-status.validator';

export class FilterApplicationDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsValidRecruitmentStatus()
    status: string;

    @IsOptional()
    vacancies: string;

    @IsOptional()
    positions: string;

    @IsOptional()
    squads: string;
}
