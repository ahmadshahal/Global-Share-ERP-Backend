import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKpiDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
