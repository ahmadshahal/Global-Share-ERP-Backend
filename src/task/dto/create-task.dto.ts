import { Type } from 'class-transformer';
import {
    IsDate,
    IsNotEmpty,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(250)
    description: string;

    @IsNotEmpty()
    @IsUrl()
    @MinLength(3)
    @MaxLength(50)
    url: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    deadline: Date;
}
