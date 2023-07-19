import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateStatusDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsBoolean()
    crucial?: boolean;

    @IsNotEmpty()
    @IsNumber()
    squadId: number;
}
