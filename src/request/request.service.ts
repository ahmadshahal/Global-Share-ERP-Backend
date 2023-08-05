import {
    BadRequestException,
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
        return await this.prismaService.request.create({
            data: {
                userId: createRequestDto.userId,
                requestType: createRequestDto.requestType,
                reason: createRequestDto.reason,
                status: RequestStatus.Pending,
                date: new Date(),
            },
            include: {
                user: true,
            },
        });
    }

    async readAll(skip: number = 0, take: number = 10): Promise<Request[]> {
        return this.prismaService.request.findMany({
            include: {
                user: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
    }

    async readOne(id: number): Promise<Request> {
        return this.prismaService.request.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
    }

    async update(
        id: number,
        updateRequestDto: UpdateRequestDto,
    ): Promise<Request> {
        try {
            const request = await this.prismaService.request.findUnique({
                where: {
                    id: updateRequestDto.userId,
                },
                include: {
                    user: true,
                },
            });
            if (!request) {
                throw new NotFoundException('Request Not Found');
            }
            return await this.prismaService.$transaction(
                async (prismaService) => {
                    if (updateRequestDto.status != RequestStatus.Approved) {
                        return;
                    }
                    switch (request.requestType) {
                        case RequestType.Freeze:
                            await prismaService.user.update({
                                where: {
                                    id: request.userId,
                                },
                                data: {
                                    gsStatus: GsStatus.FREEZE,
                                    freezeCardsCount: {
                                        decrement: 1,
                                    },
                                },
                            });
                        case RequestType.Protection:
                            await prismaService.user.update({
                                where: {
                                    id: request.userId,
                                },
                                data: {
                                    protectionCardsCount: {
                                        decrement: 1,
                                    },
                                },
                            });
                        case RequestType.HeartAddition:
                            await prismaService.user.update({
                                where: {
                                    id: request.userId,
                                },
                                data: {
                                    heartsCount: {
                                        increment: 1,
                                    },
                                },
                            });
                        case RequestType.HeartDeletion:
                            await prismaService.user.update({
                                where: {
                                    id: request.userId,
                                },
                                data: {
                                    heartsCount: {
                                        decrement: 1,
                                    },
                                },
                            });
                    }
                    return await prismaService.request.update({
                        where: {
                            id,
                        },
                        data: {
                            reason: updateRequestDto.reason,
                            status: updateRequestDto.status,
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
                include: {
                    user: true,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Request Not Found');
                }
                if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                    throw new BadRequestException(
                        'Unable to delete a related request',
                    );
                }
            }
            throw error;
        }
    }
}
