import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { RecruitmentStatus } from '@prisma/client';

export class CreateEmailDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    body: string;

    @IsNotEmpty()
    @IsEnum(RecruitmentStatus)
    recruitmentStatus: RecruitmentStatus;

    @IsOptional()
    @IsString()
    cc: string;
}
