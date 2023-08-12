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
        application.answers = application.answers.map((answer) => {
            answer.content = JSON.parse(answer.content.toString());
            return answer;
        });
        return application;
    }

    async readAll(skip: number = 0, take: number = 0) {
        const applications = await this.prismaService.application.findMany({
            include: {
                answers: {
                    include: {
                        question: true,
                    },
                },
                feedbacks: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
        const parsedApplications = applications.map((application) => {
            application.answers = application.answers.map((answer) => {
                answer.content = JSON.parse(answer.content.toString());
                return answer;
            });
            return application;
        });
        const count = await this.prismaService.application.count();
        return {
            data: parsedApplications,
            count,
        };
    }

    async create(
        createApplicationDto: CreateApplicationDto,
        files: Express.Multer.File[],
    ): Promise<Application> {
        try {
            const applicationFiles =
                files?.map(async (file) => {
                    const res = await this.driveService.saveFile(
                        Date.now().toString(),
                        new PassThrough().end(file.buffer),
                        file.mimetype,
                    );
                    return res.data.webViewLink || res.data.webContentLink;
                }) ?? [];

            const answers: { questionId: number; content: string }[] = [];
            let fileAnswersCounter = 0;
            await Promise.all(
                createApplicationDto.answers.map(async (answer) => {
                    const vacancyQuestion =
                        await this.prismaService.vacancyQuestion.findFirst({
                            where: {
                                questionId: answer.questionId,
                                vacancyId: createApplicationDto.vacancyId,
                            },
                            include: {
                                question: true,
                            },
                        });
                    if (!vacancyQuestion) {
                        throw new NotFoundException(
                            'Question or Vacancy Not Found',
                        );
                    }
                    if (vacancyQuestion.question.type == QuestionType.FILE) {
                        answer.content = [
                            await applicationFiles[fileAnswersCounter],
                        ];
                        fileAnswersCounter++;
                    }
                    const stringifiedAnswer = {
                        questionId: vacancyQuestion.id,
                        content: JSON.stringify(answer.content),
                    };
                    answers.push(stringifiedAnswer);
                }),
            );

            const application = await this.prismaService.application.create({
                data: {
                    status: RecruitmentStatus.APPLIED,
                    email: createApplicationDto.email,
                    vacancyId: createApplicationDto.vacancyId,
                    answers: {
                        createMany: {
                            data: answers,
                        },
                    },
                },
            });
            const email = await this.prismaService.email.findFirst({
                where: {
                    recruitmentStatus: application.status,
                },
            });
            if (!email) {
                throw new BadRequestException(
                    'Application Status Has No Emails',
                );
            }
            this.mailService
                .sendMail({
                    to: [application.email],
                    subject: email.title,
                    text: email.body,
                    cc: email.cc?.split(','),
                })
                .then((success) => {
                    return success;
                })
                .catch((error) => {
                    return error;
                });
            return application;
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
            await this.prismaService.answer.deleteMany({
                where: {
                    applicationId: id,
                },
            });
            return await this.prismaService.application.delete({
                where: {
                    id: id,
                },
                include: {
                    answers: true,
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
                where: {
                    recruitmentStatus: updateApplicationDto.status,
                },
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
                    include: {
                        answers: true,
                    },
                });
            this.mailService
                .sendMail({
                    to: [application.email],
                    subject: email.title,
                    text: email.body,
                    cc: email.cc?.split(','),
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
