import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Status> {
        const status = await this.prismaService.status.findUnique({
            where: {
                id: id,
            },
            include: { tasks: true, squad: true },
        });
        if (!status) {
            throw new NotFoundException('Status Not Found');
        }
        return status;
    }

    async readAll(): Promise<Status[]> {
        return await this.prismaService.status.findMany({
            include: { tasks: true, squad: true },
        });
    }

    async create(createStatusDto: CreateStatusDto): Promise<Status> {
        try {
            return await this.prismaService.status.create({
                data: {
                    name: createStatusDto.name,
                    squadId: createStatusDto.squadId,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new BadRequestException('Squad not found');
                }
            }
            throw error;
        }
    }

    async delete(id: number): Promise<Status> {
        const task = await this.readOne(id);
        if (task.crucial)
            throw new BadRequestException(
                'Deletion of crucial statuses is forbidden',
            );
        try {
            return await this.prismaService.status.delete({
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
                    'Unable to delete a related status',
                    HttpStatus.BAD_REQUEST,
                    { description: 'Bad Request' },
                );
            }
            throw error;
        }
    }

    async update(
        id: number,
        updateStatusDto: UpdateStatusDto,
    ): Promise<Status> {
        try {
            return await this.prismaService.status.update({
                where: {
                    id: id,
                },
                data: {
                    name: updateStatusDto.name,
                },
                include: { tasks: true, squad: true },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Status Not Found');
                }
            }
            throw error;
        }
    }
}
