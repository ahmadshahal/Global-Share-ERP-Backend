import { IsNotEmpty, IsOptional } from 'class-validator';
import { RequestStatus, RequestType } from '@prisma/client';

export class CreateRequestDto {
    @IsNotEmpty()
    userId: number;

    @IsNotEmpty()
    requestType: RequestType;

    @IsOptional()
    reason?: string;

    @IsNotEmpty()
    status: RequestStatus;
}
