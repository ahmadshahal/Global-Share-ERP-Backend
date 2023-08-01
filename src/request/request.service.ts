import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { GsStatus, Prisma, RequestStatus, RequestType } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateRequestDto } from './dto/create-request.dto';
import { Request } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestService {
    constructor(private prismaService: PrismaService) {}

    async create(createRequestDto: CreateRequestDto): Promise<Request> {
        const { userId, requestType, reason } = createRequestDto;
        return await this.prismaService.request.create({
            data: {
                userId,
                requestType,
                reason,
                status: RequestStatus.Pending,
                date: new Date(),
            },
            include: { user: true },
        });
    }

    async readAll(): Promise<Request[]> {
        return this.prismaService.request.findMany({
            include: { user: true },
        });
    }

    async readOne(id: number): Promise<Request> {
        return this.prismaService.request.findFirst({
            where: {
                id,
            },
            include: { user: true },
        });
    }

    async update(
        id: number,
        updateRequestDto: UpdateRequestDto,
    ): Promise<Request> {
        const { userId, reason, status } = updateRequestDto;
        try {
            const request = await this.prismaService.request.findUnique({
                where: { id: userId },
                include: { user: true },
            });
            return await this.prismaService.$transaction(
                async (prismaService) => {
                    if (status == RequestStatus.Approved) {
                        if (request.requestType == RequestType.Freeze) {
                            await prismaService.user.update({
                                where: { id: request.userId },
                                data: {
                                    gsStatus: GsStatus.FREEZE,
                                    freezeCardsCount: { decrement: 1 },
                                },
                            });
                        }
                        if (request.requestType == RequestType.Protection) {
                            await prismaService.user.update({
                                where: { id: request.userId },
                                data: {
                                    protectionCardsCount: { decrement: 1 },
                                },
                            });
                        }
                        if (request.requestType == RequestType.HeartAddition) {
                            await prismaService.user.update({
                                where: { id: request.userId },
                                data: {
                                    heartsCount: { increment: 1 },
                                },
                            });
                        }
                        if (request.requestType == RequestType.HeartDeletion) {
                            await prismaService.user.update({
                                where: { id: request.userId },
                                data: {
                                    heartsCount: { decrement: 1 },
                                },
                            });
                        }
                    }
                    return await prismaService.request.update({
                        where: {
                            id,
                        },
                        data: {
                            reason,
                            status,
                        },
                    });
                },
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Request Not Found');
                }
            }
            throw error;
        }
    }

    async remove(id: number): Promise<Request> {
        try {
            return await this.prismaService.request.delete({
                where: {
                    id,
                },
                include: { user: true },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Request Not Found');
                }
                if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                    throw new HttpException(
                        'Unable to delete a related request',
                        HttpStatus.BAD_REQUEST,
                        { description: 'Bad Request' },
                    );
                }
            }
            throw error;
        }
    }
}
