import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateRecruitmentFeedbackDto } from './dto/create-recruitment-feedback.dto';
import { UpdateRecruitmentFeedbackDto } from './dto/update-recruitment-feedback.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RecruitmentFeedback } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class RecruitmentFeedbackService {
    constructor(private readonly prismaService: PrismaService) {}

    async readAll(
        skip: number = 0,
        take: number = 10,
    ): Promise<RecruitmentFeedback[]> {
        return await this.prismaService.recruitmentFeedback.findMany({
            include: {
                application: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
    }

    async readOne(id: number): Promise<RecruitmentFeedback> {
        const feedback =
            await this.prismaService.recruitmentFeedback.findUnique({
                where: {
                    id,
                },
                include: {
                    application: true,
                },
            });
        if (!feedback) {
            throw new NotFoundException('Recruitment Feedback not found');
        }
        return feedback;
    }

    async create(
        createRecruitmentFeedbackDto: CreateRecruitmentFeedbackDto,
    ): Promise<RecruitmentFeedback> {
        try {
            return await this.prismaService.recruitmentFeedback.create({
                data: {
                    application: {
                        connect: {
                            id: createRecruitmentFeedbackDto.applicationId,
                        },
                    },
                    type: createRecruitmentFeedbackDto.type,
                    text: createRecruitmentFeedbackDto.text,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new BadRequestException('Application not found');
                }
            }
            throw error;
        }
    }

    async update(
        id: number,
        updateRecruitmentFeedbackDto: UpdateRecruitmentFeedbackDto,
    ): Promise<RecruitmentFeedback> {
        try {
            return await this.prismaService.recruitmentFeedback.update({
                where: {
                    id,
                },
                data: {
                    application: {
                        connect: {
                            id: updateRecruitmentFeedbackDto.applicationId,
                        },
                    },
                    type: updateRecruitmentFeedbackDto.type,
                    text: updateRecruitmentFeedbackDto.text,
                },
                include: {
                    application: true,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException(
                        'Recruitment Feedback or Application not found',
                    );
                }
            }
            throw error;
        }
    }

    async remove(id: number) {
        try {
            return await this.prismaService.recruitmentFeedback.delete({
                where: {
                    id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException(
                        'Recruitment Feedback not found',
                    );
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException(
                    'Unable to delete a related Feedback',
                );
            }
            throw error;
        }
    }
}
