import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Vacancy, VacancyQuestion } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { AddQuestionToVacancyDto } from './dto/add-question-to-vacancy.dto';
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

    async readQuestionsOfVacancy(id: number) {
        return await this.prismaService.vacancyQuestion.findMany({
            where: {
                vacancyId: id,
            },
            include: {
                question: true,
                answer: true,
            },
        });
    }

    async addQuestionToVacancy(
        addQuestionToVacancyDto: AddQuestionToVacancyDto,
        vacancyId: number,
    ): Promise<VacancyQuestion> {
        const { questionId } = addQuestionToVacancyDto;

        const questionExists = await this.prismaService.question.findUnique({
            where: {
                id: questionId,
            },
        });

        if (!questionExists) {
            throw new NotFoundException(
                `Question with ID ${questionId} not found`,
            );
        }

        const vacancyExists = await this.prismaService.vacancy.findUnique({
            where: {
                id: vacancyId,
            },
        });

        if (!vacancyExists) {
            throw new NotFoundException(
                `Vacancy with ID ${vacancyId} not found`,
            );
        }

        return await this.prismaService.vacancyQuestion.create({
            data: {
                questionId,
                vacancyId,
            },
            include: {
                question: true,
                vacancy: true,
                answer: true,
            },
        });
    }

    async removeQuestionFromVacancy(id: number): Promise<VacancyQuestion> {
        const deletedVacancyQuestion =
            await this.prismaService.vacancyQuestion.delete({
                where: {
                    id,
                },
            });

        if (!deletedVacancyQuestion) {
            throw new NotFoundException(
                `VacancyQuestion with ID ${id} not found`,
            );
        }

        return deletedVacancyQuestion;
    }
}
