import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prismaService: PrismaService) {}

    async readBySquad(
        squadId: number,
        skip: number = 0,
        take: number = 10,
    ) {
        const tasks = await this.prismaService.status.findMany({
            where: {
                squadId: squadId
            },
            include: {
                tasks: {
                    skip: skip,
                    take: take == 0 ? undefined : take,
                },
            }
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
                status: true,
                comments: true,
                kpis: true,
                step: true,
            },
        });
        if (!task) {
            throw new NotFoundException('Task Not Found');
        }
        return task;
    }

    async readAll(skip: number = 0, take: number = 10) {
        return await this.prismaService.status.findMany({
            include: {
                tasks: {
                    skip: skip,
                    take: take == 0 ? undefined : take,
                },
            },
        });
    }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        try {
            return await this.prismaService.task.create({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    url: createTaskDto.url,
                    deadline: createTaskDto.deadline,
                    priority: createTaskDto.priority,
                    difficulty: createTaskDto.difficulty,
                    statusId: createTaskDto.statusId,
                    assignedById: createTaskDto.assignedById,
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

    async update(id: number, updateTaskDto: UpdateTaskDto) {
        try {
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
