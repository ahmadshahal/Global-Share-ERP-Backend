import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Vacancy } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Injectable()
export class VacancyService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Vacancy> {
        const vacancy = await this.prismaService.vacancy.findUnique({
            where: {
                id: id,
            },
            include: {
                position: {
                    include: {
                        squad: true,
                    },
                },
            },
        });
        if (!vacancy) {
            throw new NotFoundException('Vacancy Not Found');
        }
        return vacancy;
    }

    async readAll(): Promise<Vacancy[]> {
        return await this.prismaService.vacancy.findMany({
            include: {
                position: {
                    include: {
                        squad: true,
                    },
                },
            },
        });
    }

    async create(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
        try {
            return await this.prismaService.vacancy.create({
                data: {
                    brief: createVacancyDto.brief,
                    tasks: createVacancyDto.tasks,
                    preferred: createVacancyDto.preferred,
                    required: createVacancyDto.required,
                    effect: createVacancyDto.effect,
                    isOpen: true,
                    position: {
                        connect: {
                            id: createVacancyDto.positionId,
                        },
                    },
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

    async delete(id: number) {
        try {
            await this.prismaService.vacancy.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Vacancy Not Found');
                }
            }
            throw error;
        }
    }

    async update(
        id: number,
        updateVacancyDto: UpdateVacancyDto,
    ): Promise<Vacancy> {
        try {
            return await this.prismaService.vacancy.update({
                where: { id },
                data: {
                    brief: updateVacancyDto.brief,
                    tasks: updateVacancyDto.tasks,
                    preferred: updateVacancyDto.preferred,
                    required: updateVacancyDto.required,
                    effect: updateVacancyDto.effect,
                    isOpen: true,
                    position: {
                        connect: {
                            id: updateVacancyDto.positionId,
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
}
