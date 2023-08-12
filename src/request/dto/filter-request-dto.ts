import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsValidRequestStatus } from 'src/validators/validate-request-status.validator';
import { RequestType } from '@prisma/client';

export class FilterRequestDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    squads: string;

    @IsOptional()
    volunteers: string;

    @IsOptional()
    @IsValidRequestStatus()
    status: string;

    @IsOptional()
    @IsEnum(RequestType)
    type: RequestType;
}
