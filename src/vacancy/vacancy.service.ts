import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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

    async readAll(skip: number = 0, take: number = 10): Promise<Vacancy[]> {
        return await this.prismaService.vacancy.findMany({
            include: {
                position: {
                    include: {
                        squad: true,
                    },
                },
            },
            skip: skip,
            take: take == 0 ? undefined : take,
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
                    positionId: createVacancyDto.positionId,
                    questions: {
                        createMany: {
                            data: createVacancyDto.questionsIds.map((id) => ({
                                questionId: id
                            })),
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Position or Question Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            return await this.prismaService.vacancy.delete({
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
                    positionId: updateVacancyDto.positionId,
                    questions: {
                        deleteMany: {
                            vacancyId: updateVacancyDto.questionsIds ? id : undefined
                        },
                        createMany: {
                            data: updateVacancyDto.questionsIds?.map((id) => ({
                                questionId: id
                            })) ?? [],
                        }
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException(
                        'Vacancy Or Position Not Found',
                    );
                }
                if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                    throw new BadRequestException(
                        'Unable to delete a related Vacancy',
                    );
                }
            }
            throw error;
        }
    }

    async readQuestionsOfVacancy(
        id: number,
        skip: number = 0,
        take: number = 10,
    ) {
        return await this.prismaService.vacancyQuestion.findMany({
            where: {
                vacancyId: id,
            },
            include: {
                question: true,
                answer: true,
            },
            skip: skip,
            take: take,
        });
    }
}
