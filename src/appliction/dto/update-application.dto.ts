import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RecruitmentStatus } from '@prisma/client';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
    @IsNotEmpty()
    @IsEnum(RecruitmentStatus)
    status: RecruitmentStatus;

    @IsNotEmpty()
    reason: string;
}
