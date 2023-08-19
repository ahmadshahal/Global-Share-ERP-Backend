import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Email } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { FilterEmailDto } from './dto/filter-email.dto';

@Injectable()
export class EmailService {
    constructor(private readonly prismaService: PrismaService) {}
    async create(createEmailDto: CreateEmailDto): Promise<Email> {
        const oldEmail = await this.prismaService.email.findFirst({
            where: {
                recruitmentStatus: createEmailDto.recruitmentStatus,
            },
        });

        if (oldEmail) {
            throw new BadRequestException(
                'An email with the same status already exists',
            );
        }

        return await this.prismaService.email.create({
            data: {
                title: createEmailDto.title,
                body: createEmailDto.body,
                recruitmentStatus: createEmailDto.recruitmentStatus,
                cc: createEmailDto.cc,
            },
        });
    }

    async readAll(filters: FilterEmailDto, skip: number, take: number) {
        const { search } = filters;
        const [data, count] = await this.prismaService.$transaction([
            this.prismaService.email.findMany({
                where: {
                    OR: search
                        ? [
                              {
                                  title: {
                                      contains: search,
                                  },
                              },
                              {
                                  body: {
                                      contains: search,
                                  },
                              },
                          ]
                        : undefined,
                },
                skip: skip,
                take: take == 0 ? undefined : take,
            }),
            this.prismaService.email.count({
                where: {
                    OR: search
                        ? [
                              {
                                  title: {
                                      contains: search,
                                  },
                              },
                              {
                                  body: {
                                      contains: search,
                                  },
                              },
                          ]
                        : undefined,
                },
            }),
        ]);
        return {
            data,
            count,
        };
    }

    async readOne(id: number) {
        const email = await this.prismaService.email.findUnique({
            where: {
                id,
            },
        });
        if (!email) {
            throw new NotFoundException('Email Not Found');
        }
        return email;
    }

    async update(id: number, updateEmailDto: UpdateEmailDto) {
        try {
            if(updateEmailDto.recruitmentStatus) {
                const oldEmail = await this.prismaService.email.findFirst({
                    where: {
                        recruitmentStatus: updateEmailDto.recruitmentStatus ?? null,
                        id: { not: id },
                    },
                });
                if (oldEmail) {
                    throw new BadRequestException(
                        'An email with the same status already exists',
                    );
                }
            }
            return await this.prismaService.email.update({
                where: {
                    id,
                },
                data: {
                    title: updateEmailDto.title,
                    body: updateEmailDto.body,
                    recruitmentStatus: updateEmailDto.recruitmentStatus,
                    cc: updateEmailDto.cc,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Email Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            return await this.prismaService.email.delete({
                where: {
                    id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Email Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException(
                    'Unable to delete a related Email',
                );
            }
            throw error;
        }
    }
}
