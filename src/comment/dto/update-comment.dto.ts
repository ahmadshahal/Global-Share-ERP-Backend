import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
    @IsNotEmpty()
    @MinLength(1)
    content: string;
}
