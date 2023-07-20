import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateFeedbackDto {
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsNotEmpty()
    @MinLength(3)
    title: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(3)
    body: string;
}
