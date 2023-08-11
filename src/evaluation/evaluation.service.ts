import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { Evaluation, Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class EvaluationService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        createEvaluationDto: CreateEvaluationDto,
    ): Promise<Evaluation> {
        return await this.prisma.evaluation.create({
            data: {
                userId: createEvaluationDto.userId,
                competencyId: createEvaluationDto.competencyId,
                text: createEvaluationDto.text,
                mark: createEvaluationDto.mark,
                evaluatorId: createEvaluationDto.evaluatorId,
                date: createEvaluationDto.date,
            },
        });
    }

    async readAll(skip: number = 0, take: number = 10) {
        const data = this.prisma.evaluation.findMany({
            include: {
                user: true,
                competency: true,
                evaluator: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
        const count = await this.prisma.evaluation.count();
        return {
            data,
            count,
        };
    }

    async readOne(id: number): Promise<Evaluation> {
        const evaluation = await this.prisma.evaluation.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
                competency: true,
                evaluator: true,
            },
        });

        if (!evaluation) {
            throw new NotFoundException(`Evaluation with ID ${id} not found`);
        }

        return evaluation;
    }

    async update(
        id: number,
        updateEvaluationDto: UpdateEvaluationDto,
    ): Promise<Evaluation> {
        try {
            return await this.prisma.evaluation.update({
                where: { id },
                data: {
                    userId: updateEvaluationDto.userId,
                    competencyId: updateEvaluationDto.competencyId,
                    text: updateEvaluationDto.text,
                    mark: updateEvaluationDto.mark,
                    evaluatorId: updateEvaluationDto.evaluatorId,
                    date: updateEvaluationDto.date,
                },
                include: {
                    user: true,
                    competency: true,
                    evaluator: true,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Evaluation Not Found');
                }
            }
            throw error;
        }
    }

    async remove(id: number): Promise<Evaluation> {
        try {
            return await this.prisma.evaluation.delete({
                where: {
                    id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Evaluation Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException(
                    'Unable to delete a related Evaluation',
                );
            }
            throw error;
        }
    }
}
