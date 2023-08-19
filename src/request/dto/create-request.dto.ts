import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { RequestStatus, RequestType } from '@prisma/client';

export class CreateRequestDto {
    @IsNotEmpty()
    @IsInt()
    userId: number;

    @IsNotEmpty()
    @IsEnum(RequestType)
    requestType: RequestType;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(RequestStatus)
    status: RequestStatus;
}
