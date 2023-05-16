import { Injectable, NotFoundException } from '@nestjs/common';
import { Position, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number) {
        const position = await this.prismaService.position.findFirst({
            where: {
                id: id,
            },
            include: {
                squad: true,
            },
        });
        if (!position) {
            throw new NotFoundException('Position Not Found');
        }
        return position;
    }

    async readAll() {
        return await this.prismaService.position.findMany({
            include: {
                squad: true,
            },
        });
    }

    async create(createPositionDto: CreatePositionDto) {
        try {
            await this.prismaService.position.create({
                data: {
                    name: createPositionDto.name,
                    gsName: createPositionDto.gsName,
                    gsLevel: createPositionDto.gsLevel,
                    jobDescription: createPositionDto.jobDescription,
                    weeklyHours: createPositionDto.weeklyHours,
                    squad: {
                        connect: {
                            id: createPositionDto.squadId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Squad Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            await this.prismaService.position.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Position Not Found');
                }
            }
            throw error;
        }
    }

    async update(id: number, updatePositionDto: UpdatePositionDto) {
        try {
            await this.prismaService.position.update({
                where: {
                    id: id,
                },
                data: {
                    name: updatePositionDto.name,
                    gsName: updatePositionDto.gsName,
                    gsLevel: updatePositionDto.gsLevel,
                    jobDescription: updatePositionDto.jobDescription,
                    weeklyHours: updatePositionDto.weeklyHours,
                    squad: {
                        connect: {
                            id: updatePositionDto.squadId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Position or Squad Not Found');
                }
            }
            throw error;
        }
    }
}
