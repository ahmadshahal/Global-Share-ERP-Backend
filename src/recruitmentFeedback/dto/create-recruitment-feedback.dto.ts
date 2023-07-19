import { RecruitmentStatus } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';

export class CreateRecruitmentFeedbackDto {
    @IsNotEmpty()
    @IsNumber()
    applicationId: number;

    @IsNotEmpty()
    @IsEnum(RecruitmentStatus)
    type: RecruitmentStatus;

    @IsNotEmpty()
    @IsString()
    text: string;
}
