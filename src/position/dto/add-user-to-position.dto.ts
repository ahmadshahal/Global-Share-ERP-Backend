import { IsDate, IsNotEmpty } from 'class-validator';

export class AddUserToPositionDto {
    @IsNotEmpty()
    userId: number;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;
}
