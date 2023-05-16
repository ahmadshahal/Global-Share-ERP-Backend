import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreateStatusDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;
    
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    squadId: number;
}
