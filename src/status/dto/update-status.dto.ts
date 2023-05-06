import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateStatusDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;
}
