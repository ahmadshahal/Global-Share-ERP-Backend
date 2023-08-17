import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsValidRequestStatus } from 'src/validators/validate-request-status.validator';
import { RequestType } from '@prisma/client';
import { RequestGeneralType } from '../enums/request-general-type.enum';

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

    @IsOptional()
    @IsEnum(RequestGeneralType)
    generalType: RequestGeneralType;
}
