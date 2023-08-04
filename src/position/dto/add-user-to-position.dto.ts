import { IsDate, IsInt, IsNotEmpty } from 'class-validator';

export class AddUserToPositionDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;
}
