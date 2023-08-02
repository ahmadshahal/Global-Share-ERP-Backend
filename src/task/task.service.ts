import {
    HttpException,
    HttpStatus,
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

    async readBySquad(squadId: number, skip: number = 0, take: number = 10): Promise<Task[]> {
        const tasks = await this.prismaService.task.findMany({
            where: {
                status: {
                    squadId: squadId,
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
                kpis: true,
                step: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take
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

    async readAll(skip: number = 0, take: number = 10): Promise<Task[]> {
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
                kpis: true,
                step: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take
        });
        return tasks;
    }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        try {
            const {
                title,
                description,
                url,
                deadline,
                priority,
                difficulty,
                statusId,
                assignedById,
                assignedToId,
                stepId,
                kpis,
            } = createTaskDto;
            return await this.prismaService.task.create({
                data: {
                    title,
                    description,
                    url,
                    deadline: new Date(deadline),
                    priority,
                    difficulty,
                    status: { connect: { id: statusId } },
                    assignedBy: { connect: { id: assignedById } },
                    assignedTo: { connect: { id: assignedToId } },
                    step: stepId ? { connect: { id: stepId } } : undefined,
                    kpis: {
                        createMany: {
                            data: kpis.map((kpi) => ({
                                kpiId: kpi.kpiId,
                                description: kpi.description || null,
                                grade: kpi.grade || null,
                            })),
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
            const {
                title,
                description,
                url,
                deadline,
                priority,
                difficulty,
                statusId,
                assignedById,
                assignedToId,
                stepId,
                kpis,
            } = updateTaskDto;
            await this.prismaService.task.update({
                where: {
                    id: id,
                },
                data: {
                    title,
                    description,
                    url,
                    deadline: new Date(deadline),
                    priority,
                    difficulty,
                    status: { connect: { id: statusId } },
                    assignedBy: { connect: { id: assignedById } },
                    assignedTo: { connect: { id: assignedToId } },
                    step: stepId
                        ? { connect: { id: stepId } }
                        : { disconnect: true },
                    kpis: {
                        deleteMany: {},
                        createMany: {
                            data: kpis.map((kpi) => ({
                                kpiId: kpi.kpiId,
                                description: kpi.description || null,
                                grade: kpi.grade || null,
                            })),
                        },
                    },
                },
                include: {
                    comments: true,
                    assignedBy: true,
                    assignedTo: true,
                    kpis: true,
                    step: true,
                    status: true,
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
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new HttpException(
                    'Unable to delete a related task',
                    HttpStatus.BAD_REQUEST,
                    { description: 'Bad Request' },
                );
            }
            throw error;
        }
    }
}
