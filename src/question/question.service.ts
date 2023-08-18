import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Prisma, Question, QuestionType } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { FilterQuestionDto } from './dto/filter-question.dto';

@Injectable()
export class QuestionService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
        const question = await this.prisma.question.create({
            data: {
                text: createQuestionDto.text,
                type: createQuestionDto.type,
                options: createQuestionDto.options
                    ? JSON.stringify(createQuestionDto.options)
                    : undefined,
            },
        });

        if (question.options) {
            question.options = JSON.parse(question.options.toString());
        }
        return question;
    }

    async readAll(filters: FilterQuestionDto, skip: number, take: number) {
        const { search, type } = filters;
        const [questions, count] = await this.prisma.$transaction([
            this.prisma.question.findMany({
                where: {
                    AND: [
                        {
                            type: type
                                ? {
                                      in: type
                                          .split(',')
                                          .map((value) => QuestionType[value]),
                                  }
                                : undefined,
                        },
                        {
                            text: search ? { contains: search } : undefined,
                        },
                    ],
                },
                skip: skip,
                take: take == 0 ? undefined : take,
            }),
            this.prisma.question.count({
                where: {
                    AND: [
                        {
                            type: type
                                ? {
                                      in: type
                                          .split(',')
                                          .map((value) => QuestionType[value]),
                                  }
                                : undefined,
                        },
                        {
                            text: search ? { contains: search } : undefined,
                        },
                    ],
                },
            }),
        ]);
        const parsedQuestions = questions.map((question) => {
            if (question.options) {
                question.options = JSON.parse(question.options.toString());
            }
            return question;
        });
        return {
            data: parsedQuestions,
            count,
        };
    }

    async readOne(id: number): Promise<Question> {
        const question = await this.prisma.question.findUnique({
            where: {
                id,
            },
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }

        if (question.options) {
            question.options = JSON.parse(question.options.toString());
        }

        return question;
    }

    async update(
        id: number,
        updateQuestionDto: UpdateQuestionDto,
    ): Promise<Question> {
        try {
            const question = await this.prisma.question.update({
                where: {
                    id,
                },
                data: {
                    text: updateQuestionDto.text,
                    type: updateQuestionDto.type,
                    options: updateQuestionDto.options
                        ? JSON.stringify(updateQuestionDto.options)
                        : undefined,
                },
            });
            if (question.options) {
                question.options = JSON.parse(question.options.toString());
            }
            return question;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Question Not Found');
                }
            }
            throw error;
        }
    }

    async remove(id: number): Promise<Question> {
        try {
            const question = await this.prisma.question.delete({
                where: {
                    id,
                },
            });
            if (question.options) {
                question.options = JSON.parse(question.options.toString());
            }
            return question;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Question Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException(
                    'Unable to delete a related Question',
                );
            }
            throw error;
        }
    }
}
