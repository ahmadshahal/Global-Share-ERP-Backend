import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, Comment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateTaskDto } from './dto/in/create-task.dto';
import { exclude } from 'src/utils/utils';
import { toTaskOutDto } from './mappers/task.mapper';
import { UpdateTaskDto } from './dto/in/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prismaService: PrismaService) {}

    async readBySquad(squadId: number) {
        const tasks = await this.prismaService.task.findMany({
            where: {
                statusBoard: {
                    board: {
                        squadId: squadId,
                    },
                },
            },
            include: {
                assignedBy: true,
                statusBoard: {
                    select: {
                        status: true,
                    },
                },
                comments: true,
            },
        });
        return tasks.map((task) =>
            toTaskOutDto({
                task: task,
                status: task.statusBoard.status,
                assignedBy: exclude(task.assignedBy, ['password']) as User,
                comments: task.comments,
            }),
        );
    }

    async readOne(id: number) {
        const task = await this.prismaService.task.findFirst({
            where: {
                id: id,
            },
            include: {
                assignedBy: true,
                statusBoard: {
                    select: {
                        status: true,
                    },
                },
                comments: true,
            },
        });
        if (!task) {
            throw new NotFoundException('Task Not Found');
        }
        return toTaskOutDto({
            task: task,
            status: task.statusBoard.status,
            assignedBy: exclude(task.assignedBy, ['password']) as User,
            comments: task.comments,
        });
    }

    async readAll() {
        const tasks = await this.prismaService.task.findMany({
            include: {
                assignedBy: true,
                statusBoard: {
                    select: {
                        status: true,
                    },
                },
                comments: true,
            },
        });
        return tasks.map((task) =>
            toTaskOutDto({
                task: task,
                status: task.statusBoard.status,
                assignedBy: exclude(task.assignedBy, ['password']) as User,
                comments: task.comments,
            }),
        );
    }

    async create(createTaskDto: CreateTaskDto, assignedById: number) {
        const statusBoard = await this.prismaService.statusBoard.findFirst({
            where: {
                statusId: createTaskDto.statusId,
                board: {
                    squadId: createTaskDto.squadId
                }
            }
        })
        if (!statusBoard) {
            throw new NotFoundException('Squad or Status Not Found');
        }
        await this.prismaService.task.create({
            data: {
                title: createTaskDto.title,
                description: createTaskDto.description,
                url: createTaskDto.url,
                deadline: createTaskDto.deadline,
                priority: createTaskDto.priority,
                difficulty: createTaskDto.difficulty,
                assignedById: assignedById,
                statusBoardId: statusBoard.id
            },
        });
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
            const task = await this.prismaService.task.findFirst({
                where: {
                    id: id,
                },
                include: {
                    statusBoard: true,
                },
            });
            if (!task) {
                throw new NotFoundException('Task Not Found');
            }
            const newStatusBoard =
                await this.prismaService.statusBoard.findFirst({
                    where: {
                        statusId: updateTaskDto.statusId,
                        boardId: task.statusBoard.boardId,
                    },
                });
            if (!newStatusBoard) {
                throw new NotFoundException('Status Not Found');
            }
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
                    statusBoardId: newStatusBoard.id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Task or Status Not Found');
                }
            }
            throw error;
        }
    }
}
