import { IsOptional } from 'class-validator';

export class FilterPositionDto {
    @IsOptional()
    squads: string;
}
