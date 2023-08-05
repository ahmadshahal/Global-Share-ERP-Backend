import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(150)
    content: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    taskId: number;
}
