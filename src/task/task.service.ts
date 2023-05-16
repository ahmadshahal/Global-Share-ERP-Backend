import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, Comment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prismaService: PrismaService) {}

    async readBySquad(squadId: number) {
        const tasks = await this.prismaService.task.findMany({
            where: {
                status: {
                    board: {
                        squadId: squadId,
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
                status: true,
                comments: true,
            },
        });
        return tasks;
    }

    async readOne(id: number) {
        const task = await this.prismaService.task.findFirst({
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
            },
        });
        if (!task) {
            throw new NotFoundException('Task Not Found');
        }
        return task;
    }

    async readAll() {
        const tasks = await this.prismaService.task.findMany({
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
            },
        });
        return tasks;
    }

    async create(createTaskDto: CreateTaskDto, assignedById: number) {
        try {
            await this.prismaService.task.create({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    url: createTaskDto.url,
                    deadline: createTaskDto.deadline,
                    priority: createTaskDto.priority,
                    difficulty: createTaskDto.difficulty,
                    assignedBy: {
                        connect: {
                            id: assignedById,
                        },
                    },
                    status: {
                        connect: {
                            id: createTaskDto.statusId,
                        },
                    },
                    assignedTo: {
                        connect: {
                            id: createTaskDto.assignedToId,
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

    async delete(id: number) {
        try {
            await this.prismaService.task.delete({
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
            throw error;
        }
    }

    async update(id: number, updateTaskDto: UpdateTaskDto) {
        try {
            await this.prismaService.task.update({
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
                    status: {
                        connect: {
                            id: updateTaskDto.statusId,
                        },
                    },
                    assignedTo: {
                        connect: {
                            id: updateTaskDto.assignedToId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Task, User, or Status Not Found');
                }
            }
            throw error;
        }
    }
}
