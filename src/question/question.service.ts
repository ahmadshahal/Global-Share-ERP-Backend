import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Prisma, Question } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class QuestionService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
        const { text, type, options } = createQuestionDto;

        return await this.prisma.question.create({
            data: {
                text,
                type,
                options: options ? JSON.stringify(options) : null,
            },
        });
    }

    async readAll(): Promise<Question[]> {
        return await this.prisma.question.findMany({
            include: {
                positions: true,
            },
        });
    }

    async readOne(id: number): Promise<Question> {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                positions: true,
            },
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }

        return question;
    }

    async update(
        id: number,
        updateQuestionDto: UpdateQuestionDto,
    ): Promise<Question> {
        const { text, type, options } = updateQuestionDto;
        try {
            return await this.prisma.question.update({
                where: { id },
                data: {
                    text,
                    type,
                    options: options ? JSON.stringify(options) : null,
                },
                include: {
                    positions: true,
                },
            });
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
            return await this.prisma.question.delete({
                where: { id },
                include: {
                    positions: true,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Question Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new HttpException(
                    'Unable to delete a related Question',
                    HttpStatus.BAD_REQUEST,
                    { description: 'Bad Request' },
                );
            }
            throw error;
        }
    }
}
