import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    GsLevel,
    GsStatus,
    Prisma,
    RequestStatus,
    RequestType,
} from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateRequestDto } from './dto/create-request.dto';
import { Request } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request-dto';
import { RequestGeneralType } from 'src/request/enums/request-general-type.enum';

@Injectable()
export class RequestService {
    constructor(private prismaService: PrismaService) {}

    async create(
        userId: number,
        createRequestDto: CreateRequestDto,
    ): Promise<Request> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: createRequestDto.userId,
            },
            include: {
                positions: {
                    include: {
                        position: {
                            include: {
                                squad: true,
                            },
                        },
                    },
                },
            },
        });
        const applier = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                positions: {
                    include: {
                        position: {
                            include: {
                                squad: true,
                            },
                        },
                    },
                },
            },
        });
        const isOrchestrator = applier.positions.some(
            (position) =>
                position.position.gsLevel == GsLevel.ORCHESTRATOR &&
                user.positions.some(
                    (position2) =>
                        position2.position.squadId == position.position.squadId,
                ),
        );
        const isGeneral =
            createRequestDto.requestType === RequestType.HEART_DELETION ||
            createRequestDto.requestType === RequestType.HEART_ADDITION;
        if (
            (createRequestDto.requestType == RequestType.FREEZE ||
                createRequestDto.requestType == RequestType.PROTECTION) &&
            userId != createRequestDto.userId
        ) {
            throw new BadRequestException(
                'You do not have the required permissions..',
            );
        }
        if (
            (createRequestDto.requestType == RequestType.HEART_ADDITION ||
                createRequestDto.requestType == RequestType.HEART_DELETION) &&
            !isOrchestrator
        ) {
            throw new BadRequestException(
                'You do not have the required permissions..',
            );
        }
        if (
            createRequestDto.requestType == RequestType.FREEZE &&
            !user.freezeCardsCount
        ) {
            throw new BadRequestException("You don't have enough freeze cards");
        } else if (
            createRequestDto.requestType == RequestType.PROTECTION &&
            !user.protectionCardsCount
        ) {
            throw new BadRequestException(
                "You don't have enough protection cards",
            );
        }
        const oldRequest = await this.prismaService.request.findFirst({
            where: {
                userId: createRequestDto.userId,
                requestType: createRequestDto.requestType,
                status: RequestStatus.PENDING,
            },
        });
        if (oldRequest) {
            throw new BadRequestException(
                "You can't apply to a new request while having a pending one",
            );
        }
        return await this.prismaService.request.create({
            data: {
                userId: createRequestDto.userId,
                requestType: createRequestDto.requestType,
                reason: createRequestDto.reason,
                status: isGeneral
                    ? RequestStatus.ORCH_APPROVED
                    : RequestStatus.PENDING,
                date: new Date(),
            },
            include: {
                user: true,
            },
        });
    }

    async readAll(filters: FilterRequestDto, skip: number, take: number) {
        const { squads, volunteers, status, search, generalType } = filters;
        const [data, count] = await this.prismaService.$transaction([
            this.prismaService.request.findMany({
                where: {
                    AND: [
                        {
                            requestType:
                                generalType == RequestGeneralType.PERSONAL
                                    ? {
                                          in: ['FREEZE', 'PROTECTION'],
                                      }
                                    : {
                                          in: [
                                              'HEART_ADDITION',
                                              'HEART_DELETION',
                                          ],
                                      },
                        },
                        {
                            status: status
                                ? {
                                      in: status
                                          ?.split(',')
                                          .map((value) => RequestStatus[value]),
                                  }
                                : undefined,
                        },

                        {
                            user: squads
                                ? {
                                      positions: {
                                          some: {
                                              position: {
                                                  squadId: {
                                                      in: squads
                                                          .split(',')
                                                          .map(
                                                              (value) => +value,
                                                          ),
                                                  },
                                              },
                                          },
                                      },
                                  }
                                : undefined,
                        },

                        {
                            OR: search
                                ? [
                                      {
                                          user: {
                                              fullName: { contains: search },
                                          },
                                      },
                                      {
                                          user: {
                                              arabicFullName: {
                                                  contains: search,
                                              },
                                          },
                                      },
                                  ]
                                : undefined,
                        },
                    ],
                },
                include: {
                    user: true,
                },
                skip: skip,
                take: take == 0 ? undefined : take,
            }),
            this.prismaService.request.count({
                where: {
                    AND: [
                        {
                            requestType:
                                generalType == RequestGeneralType.PERSONAL
                                    ? {
                                          in: ['FREEZE', 'PROTECTION'],
                                      }
                                    : {
                                          in: [
                                              'HEART_ADDITION',
                                              'HEART_DELETION',
                                          ],
                                      },
                        },
                        {
                            status: status
                                ? {
                                      in: status
                                          ?.split(',')
                                          .map((value) => RequestStatus[value]),
                                  }
                                : undefined,
                        },

                        {
                            user: squads
                                ? {
                                      positions: {
                                          some: {
                                              position: {
                                                  squadId: {
                                                      in: squads
                                                          .split(',')
                                                          .map(
                                                              (value) => +value,
                                                          ),
                                                  },
                                              },
                                          },
                                      },
                                  }
                                : undefined,
                        },

                        {
                            OR: search
                                ? [
                                      {
                                          user: {
                                              fullName: { contains: search },
                                          },
                                      },
                                      {
                                          user: {
                                              arabicFullName: {
                                                  contains: search,
                                              },
                                          },
                                      },
                                  ]
                                : undefined,
                        },
                    ],
                },
            }),
        ]);
        return {
            data,
            count,
        };
    }

    async readOne(id: number): Promise<Request> {
        const request = this.prismaService.request.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
        if (!request) {
            throw new NotFoundException('Request Not Found');
        }
        return request;
    }

    async update(
        id: number,
        updateRequestDto: UpdateRequestDto,
    ): Promise<Request> {
        try {
            return await this.prismaService.$transaction(
                async (prismaService) => {
                    const request = await prismaService.request.update({
                        where: {
                            id: id,
                        },
                        data: {
                            reason: updateRequestDto.reason,
                            status: updateRequestDto.status,
                        },
                    });
                    if (updateRequestDto.status != RequestStatus.APPROVED) {
                        return request;
                    }
                    switch (request.requestType) {
                        case RequestType.FREEZE: {
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
                            break;
                        }
                        case RequestType.PROTECTION: {
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
                            break;
                        }
                        case RequestType.HEART_ADDITION: {
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
                            break;
                        }
                        case RequestType.HEART_DELETION: {
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
                            break;
                        }
                    }
                    return request;
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
