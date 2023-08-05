import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RecruitmentStatus } from '@prisma/client';

export class UpdateApplicationDto {
    @IsNotEmpty()
    @IsEnum(RecruitmentStatus)
    status: RecruitmentStatus;

    @IsNotEmpty()
    @IsString()
    reason: string;
}
