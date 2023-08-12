import { IsOptional, IsString } from 'class-validator';

export class FilterSquadDto {
    @IsOptional()
    @IsString()
    search: string;
}
