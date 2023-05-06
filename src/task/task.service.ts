import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Task> {
        const squad = await this.prismaService.task.findFirst({
            where: {
                id: id,
            },
        });
        if (!squad) {
            throw new NotFoundException('Task Not Found');
        }
        return squad;
    }

    async readAll(): Promise<Task[]> {
        return await this.prismaService.task.findMany();
    }

    async create(createTaskDto: CreateTaskDto, assignedById: number) {
        try {
            const board = await this.prismaService.board.findUnique({
                where: {
                    squadId: createTaskDto.squadId
                },
            });
            const statusBoard = await this.prismaService.statusBoard.findFirst({
                where: {
                    statusId: createTaskDto.statusId,
                    boardId: board.id
                }
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
                    statusBoardId: statusBoard.id
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
}