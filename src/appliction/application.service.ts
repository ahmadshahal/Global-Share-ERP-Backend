import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Application, RecruitmentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { GoogleDriveService } from 'src/utils/googleDrive/googleDrive.service';
import { PassThrough } from 'stream';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ApplicationService {
    constructor(
        private prismaService: PrismaService,
        private readonly googleDriveService: GoogleDriveService,
        private mailService: MailerService,
    ) {}

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
                answers: {
                    include: { question: true },
                },
                feedbacks: true,
            },
        });
        if (!application) {
            throw new NotFoundException('Application Not Found');
        }
        return application;
    }

    async readAll(skip: number = 0, take: number = 10): Promise<Application[]> {
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
            skip: skip,
            take: take == 0 ? undefined : take
        });
    }

    async create(
        createApplicationDto: CreateApplicationDto,
    ): Promise<Application> {
        try {
            const answers = [];
            createApplicationDto.answers.map(async (answer) => {
                if (answer.file) {
                    const fileStream = new PassThrough();
                    const res = await this.googleDriveService.saveFile(
                        Date.now().toString(),
                        fileStream.end(answer.file.buffer),
                        answer.file.mimetype,
                    );
                    answers.push({
                        ...answer,
                        fileUrl:
                            res.data.webViewLink || res.data.webContentLink,
                    });
                } else {
                    answers.push(answer);
                }
            });
            return await this.prismaService.application.create({
                data: {
                    status: RecruitmentStatus.APPLIED,
                    email: createApplicationDto.email,
                    vacancy: {
                        connect: {
                            id: createApplicationDto.vacancyId,
                        },
                    },
                    answers: {
                        createMany: { data: answers },
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
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new HttpException(
                    'Unable to delete a related Application',
                    HttpStatus.BAD_REQUEST,
                    { description: 'Bad Request' },
                );
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
            const updatedApplication =
                await this.prismaService.application.update({
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
            const email = await this.prismaService.email.findFirst({
                where: { recruitmentStatus: updateApplicationDto.status },
            });
            this.mailService
                .sendMail({
                    to: [application.email],
                    subject: email.title,
                    text: email.body,
                    cc: email.cc.split(','),
                })
                .then((success) => {
                    return success;
                })
                .catch((error) => {
                    return error;
                });
            return updatedApplication;
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
