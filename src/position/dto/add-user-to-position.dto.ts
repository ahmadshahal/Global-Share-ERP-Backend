import { IsDate, IsNotEmpty } from 'class-validator';

export class AddUserToPositionDto {
    @IsNotEmpty()
    userId: number;

    @IsNotEmpty()
    positionId: number;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;
}
