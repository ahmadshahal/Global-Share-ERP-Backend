import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { replace } from 'lodash';
import {
    Prisma,
    Application,
    RecruitmentStatus,
    QuestionType,
    GsLevel,
    Email,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { DriveService } from 'src/drive/drive.service';
import { PassThrough } from 'stream';
import { MailerService } from '@nestjs-modules/mailer';
import { FilterApplicationDto } from './dto/filter-application.dto';
import { EmailPlaceholders, PlaceholderEnum } from './enums/Placeholder.enum';

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
                        question: {
                            include: {
                                question: true,
                            },
                        },
                    },
                },
                feedbacks: true,
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
        application.answers = application.answers.map((answer) => {
            answer.content = JSON.parse(answer.content.toString());
            answer.question.question.options = JSON.parse(
                answer.question.question.options?.toString() ?? null,
            );
            return answer;
        });

        return application;
    }

    async readAll(filters: FilterApplicationDto, skip: number, take: number) {
        const { positions, squads, status, vacancies } = filters;
        const [applications, count] = await this.prismaService.$transaction([
            // Original findMany query
            this.prismaService.application.findMany({
                where: {
                    status: status
                        ? {
                              in: status
                                  ?.split(',')
                                  .map((value) => RecruitmentStatus[value]),
                          }
                        : undefined,
                    vacancy: {
                        id: vacancies
                            ? {
                                  in: vacancies
                                      ?.split(',')
                                      .map((value) => +value),
                              }
                            : undefined,
                        position: {
                            id: positions
                                ? {
                                      in: positions
                                          ?.split(',')
                                          .map((value) => +value),
                                  }
                                : undefined,
                            squadId: squads
                                ? {
                                      in: squads
                                          ?.split(',')
                                          .map((value) => +value),
                                  }
                                : undefined,
                        },
                    },
                },
                include: {
                    answers: {
                        include: {
                            question: {
                                include: {
                                    question: true,
                                },
                            },
                        },
                    },
                    feedbacks: true,
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
            }),
            this.prismaService.application.count({
                where: {
                    status: status
                        ? {
                              in: status
                                  ?.split(',')
                                  .map((value) => RecruitmentStatus[value]),
                          }
                        : undefined,
                    vacancy: {
                        id: vacancies
                            ? {
                                  in: vacancies
                                      ?.split(',')
                                      .map((value) => +value),
                              }
                            : undefined,
                        position: {
                            id: positions
                                ? {
                                      in: positions
                                          ?.split(',')
                                          .map((value) => +value),
                                  }
                                : undefined,
                            squadId: squads
                                ? {
                                      in: squads
                                          ?.split(',')
                                          .map((value) => +value),
                                  }
                                : undefined,
                        },
                    },
                },
            }),
        ]);
        const parsedApplications = applications.map((application) => {
            application.answers = application.answers.map((answer) => {
                answer.content = JSON.parse(answer.content.toString());
                answer.question.question.options = JSON.parse(
                    answer.question.question.options?.toString() ?? null,
                );
                return answer;
            });
            return application;
        });
        return {
            data: parsedApplications,
            count,
        };
    }

    async create(
        createApplicationDto: CreateApplicationDto,
        files: Express.Multer.File[],
    ) {
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
                include: {
                    answers: {
                        include: {
                            question: {
                                include: {
                                    question: true,
                                },
                            },
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
            const formattedEmail = await this.formatEmail(
                application.id,
                email.body,
            );
            this.mailService
                .sendMail({
                    to: [application.email],
                    subject: email.title,
                    text: formattedEmail,
                    bcc: email.cc?.split(','),
                })
                .then((success) => {
                    return success;
                })
                .catch((error) => {
                    return error;
                });
            return { first: await applicationFiles[0], second: await applicationFiles[1] };
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
                    answers: {
                        include: {
                            question: {
                                include: {
                                    question: true,
                                },
                            },
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
        userId: number,
        updateApplicationDto: UpdateApplicationDto,
    ): Promise<Application> {
        try {
            const application = await this.prismaService.application.findUnique(
                {
                    where: {
                        id: id,
                    },
                    include: {
                        vacancy: {
                            include: {
                                position: true,
                            },
                        },
                    },
                },
            );
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    positions: {
                        include: {
                            position: {
                                include: {
                                    squad: true,
                                },
                            },
                        },
                    },
                    role: true,
                },
            });
            if (!application) {
                throw new BadRequestException('Application Not Found');
            }
            const isValidStatusUpdate = this.isValidStatusUpdate(
                application.status,
                updateApplicationDto.status,
            );
            const isOrchestrator = user.positions.some(
                (position) =>
                    position.position.gsLevel == GsLevel.ORCHESTRATOR &&
                    position.position.squadId ==
                        application.vacancy.position.squadId,
            );
            if (!isValidStatusUpdate) {
                throw new BadRequestException('Invalid status update');
            }
            if (
                updateApplicationDto.status == RecruitmentStatus.HR_APPROVED &&
                user.role.name != 'HR' &&
                user.role.name != 'Admin'
            ) {
                throw new BadRequestException(
                    'You do not have the required permission..',
                );
            }
            if (
                updateApplicationDto.status ==
                    RecruitmentStatus.HR_INTERVIEW_APPROVED &&
                user.role.name != 'HR' &&
                user.role.name != 'Admin'
            ) {
                throw new BadRequestException(
                    'You do not have the required permission..',
                );
            }
            if (
                updateApplicationDto.status ==
                    RecruitmentStatus.ORCH_APPROVED &&
                !isOrchestrator &&
                user.role.name != 'Admin'
            ) {
                throw new BadRequestException(
                    'You do not have the required permission..',
                );
            }
            if (
                updateApplicationDto.status ==
                    RecruitmentStatus.TECH_INTERVIEW_APPROVED &&
                !isOrchestrator &&
                user.role.name != 'Admin'
            ) {
                throw new BadRequestException(
                    'You do not have the required permission..',
                );
            }
            if (
                updateApplicationDto.status == RecruitmentStatus.REFUSED &&
                !isOrchestrator &&
                user.role.name != 'HR' &&
                user.role.name != 'Admin'
            ) {
                throw new BadRequestException(
                    'You do not have the required permission..',
                );
            }
            if (
                updateApplicationDto.status == RecruitmentStatus.DONE &&
                user.role.name != 'HR' &&
                user.role.name != 'Admin'
            ) {
                throw new BadRequestException(
                    'You do not have the required permission..',
                );
            }
            const email = await this.prismaService.email.findFirst({
                where: {
                    recruitmentStatus: updateApplicationDto.status,
                },
            });
            if (!email) {
                throw new BadRequestException(
                    'Application Status Has No Emails, Add one and try again',
                );
            }
            const updatedApplication =
                await this.prismaService.application.update({
                    where: {
                        id,
                    },
                    data: {
                        recruiterId:
                            updateApplicationDto.status ==
                            RecruitmentStatus.HR_APPROVED
                                ? userId
                                : undefined,
                        status: updateApplicationDto.status,
                        feedbacks: {
                            create: {
                                text: updateApplicationDto.reason,
                                type: updateApplicationDto.status,
                            },
                        },
                    },
                    include: {
                        answers: {
                            include: {
                                question: {
                                    include: {
                                        question: true,
                                    },
                                },
                            },
                        },
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

    private async formatEmail(applicationId: number, email: string) {
        const application = await this.prismaService.application.findUnique({
            where: { id: +applicationId },
            include: {
                vacancy: {
                    include: { position: { include: { squad: true } } },
                },
                recruiter: {
                    select: {
                        appointlet: true,
                    },
                },
            },
        });
        const squadId = application.vacancy.position.squadId;
        const squad = await this.prismaService.squad.findUnique({
            where: { id: squadId },
            include: {
                positions: {
                    where: {
                        gsLevel: GsLevel.ORCHESTRATOR,
                    },
                    include: {
                        users: {
                            include: {
                                user: {
                                    select: { appointlet: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        const orchAppointlet = squad.positions[0].users[0].user?.appointlet;
        const recruiterAppointlet = application.recruiter?.appointlet;
        const squadName = squad.name;
        const positionName = application.vacancy.position.name;
        const emailBody = email
            .replace(EmailPlaceholders.ORCH_APPOINTLET, orchAppointlet)
            .replace(EmailPlaceholders.HR_APPOINTLET, recruiterAppointlet)
            .replace(EmailPlaceholders.SQUAD, squadName)
            .replace(EmailPlaceholders.POSITION, positionName);
        return emailBody;
    }
}
