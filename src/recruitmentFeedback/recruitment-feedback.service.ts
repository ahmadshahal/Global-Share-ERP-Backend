import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecruitmentFeedbackDto } from './dto/create-recruitment-feedback.dto';
import { UpdateRecruitmentFeedbackDto } from './dto/update-recruitment-feedback.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RecruitmentFeedback } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class RecruitmentFeedbackService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        createRecruitmentFeedbackDto: CreateRecruitmentFeedbackDto,
    ): Promise<RecruitmentFeedback> {
        const { applicationId, type, text } = createRecruitmentFeedbackDto;
        return await this.prismaService.recruitmentFeedback.create({
            data: {
                application: { connect: { id: applicationId } },
                type,
                text,
            },
        });
    }

    async readAll(): Promise<RecruitmentFeedback[]> {
        return await this.prismaService.recruitmentFeedback.findMany({
            include: { application: true },
        });
    }

    async readOne(id: number): Promise<RecruitmentFeedback> {
        const feedback =
            await this.prismaService.recruitmentFeedback.findUnique({
                where: { id },
                include: { application: true },
            });
        if (!feedback) {
            throw new NotFoundException('Recruitment Feedback not found');
        }
        return feedback;
    }

    async update(
        id: number,
        updateRecruitmentFeedbackDto: UpdateRecruitmentFeedbackDto,
    ): Promise<RecruitmentFeedback> {
        const { applicationId, type, text } = updateRecruitmentFeedbackDto;
        try {
            return await this.prismaService.recruitmentFeedback.update({
                where: { id },
                data: {
                    application: { connect: { id: applicationId } },
                    type,
                    text,
                },
                include: { application: true },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException(
                        'Recruitment Feedback not found',
                    );
                }
            }
            throw error;
        }
    }

    async remove(id: number) {
        try {
            return await this.prismaService.recruitmentFeedback.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException(
                        'Recruitment Feedback not found',
                    );
                }
            }
            throw error;
        }
    }
}
