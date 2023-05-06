import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number) {
        const task = await this.prismaService.task.findFirst({
            where: {
                id: id,
            },
            select: {
                id: true,
                assignedBy: {
                    select: {
                        id: true,
                        email: true,
                        arabicFullName: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                    },
                },
                deadline: true,
                description: true,
                difficulty: true,
                priority: true,
                title: true,
                url: true,
                statusBoard: {
                    select: {
                        status: true,
                    },
                },
            },
        });
        if (!task) {
            throw new NotFoundException('Task Not Found');
        }
        return task;
    }

    async readAll() {
        return await this.prismaService.task.findMany({
            select: {
                id: true,
                assignedBy: {
                    select: {
                        id: true,
                        email: true,
                        arabicFullName: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                    },
                },
                deadline: true,
                description: true,
                difficulty: true,
                priority: true,
                title: true,
                url: true,
                statusBoard: {
                    select: {
                        status: true,
                    },
                },
            },
        });
    }

    async create(createTaskDto: CreateTaskDto, assignedById: number) {
        try {
            const board = await this.prismaService.board.findUnique({
                where: {
                    squadId: createTaskDto.squadId,
                },
            });
            const statusBoard = await this.prismaService.statusBoard.findFirst({
                where: {
                    statusId: createTaskDto.statusId,
                    boardId: board.id,
                },
            });
            await this.prismaService.task.create({
                data: {
                    title: createTaskDto.title,
                    description: createTaskDto.description,
                    url: createTaskDto.url,
                    deadline: createTaskDto.deadline,
                    priority: createTaskDto.priority,
                    difficulty: createTaskDto.difficulty,
                    assignedById: assignedById,
                    statusBoardId: statusBoard.id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Squad or Status Not Found');
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
            const task = await this.prismaService.task.findFirst({
                where: {
                    id: id,
                },
            });
            const previousStatusBoard =
                await this.prismaService.statusBoard.findFirst({
                    where: {
                        id: task.statusBoardId,
                    },
                });
            const newStatusBoard =
                await this.prismaService.statusBoard.findFirst({
                    where: {
                        statusId: updateTaskDto.statusId,
                        boardId: previousStatusBoard.boardId,
                    },
                });
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
