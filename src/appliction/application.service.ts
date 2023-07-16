import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Application, RecruitmentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Application> {
        const application = await this.prismaService.application.findUnique({
            where: {
                id: id,
            },
            include: {
                vacancy: {
                    include: {
                        position: {
                            include: {
                                squad: true,
                            },
                        },
                    },
                },
            },
        });
        if (!application) {
            throw new NotFoundException('Application Not Found');
        }
        return application;
    }

    async readAll(): Promise<Application[]> {
        return await this.prismaService.application.findMany({
            include: {
                vacancy: {
                    include: {
                        position: {
                            include: {
                                squad: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async create(
        createApplicationDto: CreateApplicationDto,
    ): Promise<Application> {
        try {
            return await this.prismaService.application.create({
                data: {
                    status: RecruitmentStatus.APPLIED,
                    vacancy: {
                        connect: {
                            id: createApplicationDto.vacancyId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Application Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            await this.prismaService.application.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Application Not Found');
                }
            }
            throw error;
        }
    }
    // todo: send emails
    async update(
        id: number,
        updateApplicationDto: UpdateApplicationDto,
    ): Promise<Application> {
        try {
            const application = await this.prismaService.application.findUnique(
                {
                    where: { id },
                },
            );
            if (
                !this.validStatusUpdate(
                    application.status,
                    updateApplicationDto.status,
                )
            ) {
                throw new Error('Invalid status update.');
            }
            return await this.prismaService.application.update({
                where: { id },
                data: {
                    status: updateApplicationDto.status,
                    feedbacks: {
                        create: {
                            text: updateApplicationDto.reason,
                            type: updateApplicationDto.status,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Application Not Found');
                }
            }
            throw error;
        }
    }

    validStatusUpdate(
        oldStatus: RecruitmentStatus,
        newStatus: RecruitmentStatus,
    ) {
        if (newStatus == RecruitmentStatus.REFUSED) return true;
        if (
            oldStatus == RecruitmentStatus.APPLIED &&
            newStatus == RecruitmentStatus.HR_APPROVED
        )
            return true;
        if (
            oldStatus == RecruitmentStatus.HR_APPROVED &&
            newStatus == RecruitmentStatus.ORCH_APPROVED
        )
            return true;
        if (
            oldStatus == RecruitmentStatus.ORCH_APPROVED &&
            newStatus == RecruitmentStatus.HR_INTERVIEW_APPROVED
        )
            return true;
        if (
            oldStatus == RecruitmentStatus.HR_INTERVIEW_APPROVED &&
            newStatus == RecruitmentStatus.TECH_INTERVIEW_APPROVED
        )
            return true;
        if (
            oldStatus == RecruitmentStatus.TECH_INTERVIEW_APPROVED &&
            newStatus == RecruitmentStatus.DONE
        )
            return true;
        return false;
    }
}
