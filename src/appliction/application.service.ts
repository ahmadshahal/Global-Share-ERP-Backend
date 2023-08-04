import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    Prisma,
    Application,
    RecruitmentStatus,
    QuestionType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { DriveService } from 'src/drive/drive.service';
import { PassThrough } from 'stream';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ApplicationService {
    constructor(
        private prismaService: PrismaService,
        private readonly driveService: DriveService,
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
                    include: {
                        question: true,
                    },
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
            take: take == 0 ? undefined : take,
        });
    }

    async create(
        createApplicationDto: CreateApplicationDto,
        files: Express.Multer.File[],
    ): Promise<Application> {
        try {
            const applicationFiles = files.map(async (file) => {
                const res = await this.driveService.saveFile(
                    Date.now().toString(),
                    new PassThrough().end(file.buffer),
                    file.mimetype,
                );
                return res.data.webViewLink || res.data.webContentLink;
            });

            const answers: { questionId: number; text: string }[] = [];
            var fileAnswersCounter = 0;
            createApplicationDto.answers.forEach(async (answer) => {
                const question = await this.prismaService.question.findUnique({
                    where: {
                        id: answer.questionId,
                    },
                });
                if (!question) {
                    throw new NotFoundException('Question Not Found');
                }
                if (question.type == QuestionType.FILE) {
                    answer.text = await applicationFiles[fileAnswersCounter];
                    fileAnswersCounter++;
                }
                answers.push(answer);
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
                        createMany: {
                            data: answers,
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

    async delete(id: number): Promise<Application> {
        try {
            return await this.prismaService.application.delete({
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
                throw new BadRequestException(
                    'Unable to delete a related Application',
                );
            }
            throw error;
        }
    }

    async update(
        id: number,
        updateApplicationDto: UpdateApplicationDto,
    ): Promise<Application> {
        try {
            const application = await this.prismaService.application.findUnique(
                {
                    where: {
                        id: id,
                    },
                },
            );
            if (!application) {
                throw new BadRequestException('Application Not Found');
            }
            const isValidStatusUpdate = this.isValidStatusUpdate(
                application.status,
                updateApplicationDto.status,
            );
            if (!isValidStatusUpdate) {
                throw new BadRequestException('Invalid status update');
            }
            const email = await this.prismaService.email.findFirst({
                where: { recruitmentStatus: updateApplicationDto.status },
            });
            if (!email) {
                throw new BadRequestException(
                    'Application Status Has No Emails',
                );
            }
            const updatedApplication =
                await this.prismaService.application.update({
                    where: {
                        id,
                    },
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

    private isValidStatusUpdate(
        previousStatus: RecruitmentStatus,
        newStatus: RecruitmentStatus,
    ): boolean {
        return (
            newStatus == RecruitmentStatus.REFUSED ||
            (previousStatus == RecruitmentStatus.APPLIED &&
                newStatus == RecruitmentStatus.HR_APPROVED) ||
            (previousStatus == RecruitmentStatus.HR_APPROVED &&
                newStatus == RecruitmentStatus.ORCH_APPROVED) ||
            (previousStatus == RecruitmentStatus.ORCH_APPROVED &&
                newStatus == RecruitmentStatus.HR_INTERVIEW_APPROVED) ||
            (previousStatus == RecruitmentStatus.HR_INTERVIEW_APPROVED &&
                newStatus == RecruitmentStatus.TECH_INTERVIEW_APPROVED) ||
            (previousStatus == RecruitmentStatus.TECH_INTERVIEW_APPROVED &&
                newStatus == RecruitmentStatus.DONE)
        );
    }
}
