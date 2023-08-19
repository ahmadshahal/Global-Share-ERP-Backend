import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Task, Difficulty, Priority, GsLevel } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class TaskService {
    constructor(private prismaService: PrismaService) {}

    async readBySquad(squadId: number, skip: number = 0, take: number = 10) {
        const tasks = await this.prismaService.status.findMany({
            where: {
                squadId: squadId,
            },
            include: {
                tasks: {
                    skip: skip,
                    take: take == 0 ? undefined : take,
                    include: {
                        assignedBy: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                middleName: true,
                            },
                        },
                        assignedTo: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                middleName: true,
                            },
                        },
                        comments: {
                            include: {
                                author: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        middleName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return tasks;
    }

    async readOne(id: number): Promise<Task> {
        const task = await this.prismaService.task.findUnique({
            where: {
                id: id,
            },
            include: {
                assignedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        middleName: true,
                    },
                },
                assignedTo: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        middleName: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                middleName: true,
                            },
                        },
                    },
                },
                status: true,
                kpis: true,
                step: true,
            },
        });
        if (!task) {
            throw new NotFoundException('Task Not Found');
        }
        return task;
    }

    async readAll(filters: FilterTaskDto, skip: number, take: number) {
        const { assignedTo, difficulty, priority, search, squad, status } =
            filters;
        return await this.prismaService.status.findMany({
            where: {
                squadId: squad ? +squad : undefined,
                name: status ? status : undefined,
                crucial: status ? true : undefined,
            },
            include: {
                tasks: {
                    where: {
                        AND: [
                            {
                                difficulty: difficulty
                                    ? {
                                          in: difficulty
                                              .split(',')
                                              .map(
                                                  (value) => Difficulty[value],
                                              ),
                                      }
                                    : undefined,
                            },
                            {
                                priority: priority
                                    ? {
                                          in: priority
                                              .split(',')
                                              .map((value) => Priority[value]),
                                      }
                                    : undefined,
                            },
                            {
                                assignedToId: assignedTo
                                    ? {
                                          in: assignedTo
                                              .split(',')
                                              .map((value) => +value),
                                      }
                                    : undefined,
                            },
                            {
                                OR: search
                                    ? [
                                          {
                                              title: { contains: search },
                                          },
                                          {
                                              description: { contains: search },
                                          },
                                      ]
                                    : undefined,
                            },
                        ],
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: skip,
                    take: take == 0 ? undefined : take,
                    include: {
                        assignedBy: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                middleName: true,
                            },
                        },
                        assignedTo: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                middleName: true,
                            },
                        },
                        comments: {
                            include: {
                                author: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        middleName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async create(userId: number, createTaskDto: CreateTaskDto): Promise<Task> {
        try {
            const assignedBy = await this.prismaService.user.findUnique({
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
                },
            });
            if (!assignedBy) {
                throw new NotFoundException('User Not Found');
            }
            const assignedTo = await this.prismaService.user.findUnique({
                where: {
                    id: createTaskDto.assignedToId,
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
                },
            });
            if (!assignedTo) {
                throw new NotFoundException('User Not Found');
            }
            const taskStatus = await this.prismaService.status.findUnique({
                where: {
                    id: createTaskDto.statusId,
                },
                include: {
                    squad: true,
                },
            });
            if (!taskStatus) {
                throw new NotFoundException('Status Not Found');
            }
            const taskSquadId = taskStatus.squadId;
            const isAssignedByAnOrchestrator = assignedBy.positions.some(
                (position) =>
                    position.position.gsLevel == GsLevel.ORCHESTRATOR &&
                    position.position.squadId == taskSquadId,
            );
            const isAssignedByInTheSquad = assignedBy.positions.some(
                (position) => position.position.squadId == taskSquadId,
            );
            const isAssignedToInTheSquad = assignedTo.positions.some(
                (position) => position.position.squadId == taskSquadId,
            );
            if (
                !(
                    isAssignedToInTheSquad &&
                    (isAssignedByAnOrchestrator ||
                        (isAssignedByInTheSquad &&
                            assignedBy.id == assignedTo.id))
                )
            ) {
                throw new BadRequestException(
                    'You do not have the required permissions..',
                );
            }
            return await this.prismaService.task.create({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    url: createTaskDto.url,
                    deadline: createTaskDto.deadline,
                    priority: createTaskDto.priority,
                    difficulty: createTaskDto.difficulty,
                    statusId: createTaskDto.statusId,
                    assignedById: userId,
                    assignedToId: createTaskDto.assignedToId,
                    stepId: createTaskDto.stepId,
                    kpis: {
                        createMany: {
                            data:
                                createTaskDto.kpis?.map((kpi) => ({
                                    kpiId: kpi.kpiId,
                                    description: kpi.description,
                                    grade: kpi.grade,
                                })) ?? [],
                        },
                    },
                },
                include: {
                    assignedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            middleName: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            middleName: true,
                        },
                    },
                    comments: {
                        include: {
                            author: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    middleName: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('User or Status Not Found');
                }
            }
            throw error;
        }
    }

    async update(userId: number, id: number, updateTaskDto: UpdateTaskDto) {
        try {
            const newStatus = await this.prismaService.status.findUnique({
                where: { id: updateTaskDto.statusId },
            });
            const task = await this.prismaService.task.findUnique({
                where: { id },
                include: {
                    status: true,
                },
            });
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
                },
            });
            const isOrchestrator = user.positions.some(
                (position) =>
                    position.position.gsLevel == GsLevel.ORCHESTRATOR &&
                    position.position.squadId == newStatus.squadId,
            );
            if (task.assignedToId != userId && !isOrchestrator) {
                throw new BadRequestException(
                    'You do not have the required permissions..',
                );
            }
            if (task.status.name == 'Approved') {
                throw new BadRequestException(
                    'Approved tasks can not be edited..',
                );
            }
            if (newStatus.crucial && newStatus.name == 'Approved') {
                if (!isOrchestrator) {
                    throw new BadRequestException(
                        'You do not have the required permissions..',
                    );
                }
                await this.prismaService.user.update({
                    where: { id: task.assignedToId },
                    data: {
                        volunteeredHours: {
                            increment: task.takenHours,
                        },
                    },
                });
            }
            if (newStatus.crucial && newStatus.name == 'Done') {
                if (!updateTaskDto.hoursTaken) {
                    throw new BadRequestException(
                        'Taken hours are required when finishing a task..',
                    );
                }
            }
            return await this.prismaService.task.update({
                where: {
                    id: id,
                },
                data: {
                    title: updateTaskDto.title,
                    description: updateTaskDto.description,
                    url: updateTaskDto.url,
                    deadline: updateTaskDto.deadline,
                    priority: updateTaskDto.priority,
                    difficulty: updateTaskDto.difficulty,
                    statusId: updateTaskDto.statusId,
                    assignedById: updateTaskDto.assignedById,
                    assignedToId: updateTaskDto.assignedToId,
                    stepId: updateTaskDto.stepId,
                    kpis: {
                        deleteMany: {
                            taskId: updateTaskDto.kpis ? id : undefined,
                        },
                        createMany: {
                            data:
                                updateTaskDto.kpis?.map((kpi) => ({
                                    kpiId: kpi.kpiId,
                                    description: kpi.description,
                                    grade: kpi.grade,
                                })) ?? [],
                        },
                    },
                    takenHours: updateTaskDto.hoursTaken,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException(
                        'Task, User, or Status Not Found',
                    );
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            return await this.prismaService.task.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Task Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException(
                    'Unable to delete a related task',
                );
            }
            throw error;
        }
    }
}
