import { IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
    @IsNotEmpty()
    vacancyId: number;
}
