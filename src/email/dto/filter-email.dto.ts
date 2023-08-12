import { IsOptional, IsString } from 'class-validator';

export class FilterEmailDto {
    @IsOptional()
    @IsString()
    search: string;
}
