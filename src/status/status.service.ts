import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Status, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateStatusDto } from './dto/update-status.dto';
import { error } from 'console';

@Injectable()
export class StatusService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Status> {
        const status = await this.prismaService.status.findFirst({
            where: {
                id: id,
            },
        });
        if (!status) {
            throw new NotFoundException('Status Not Found');
        }
        return status;
    }

    async readAll(): Promise<Status[]> {
        return await this.prismaService.status.findMany();
    }

    async create(createStatusDto: CreateStatusDto) {
        const statuses = await this.readAll();
        if (statuses.find((s) => s.name == createStatusDto.name)) {
            throw new BadRequestException('Duplicate Entry');
        }
        await this.prismaService.status.create({
            data: {
                name: createStatusDto.name,
            },
        });
    }

    async delete(id: number) {
        if (id < 5) {
            throw new BadRequestException("Can't delete a main status");
        }
        try {
            await this.prismaService.status.delete({
                where: {
                    id: id,
                },
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

    async update(id: number, updateStatusDto: UpdateStatusDto) {
        const statuses = await this.readAll();
        if (statuses.find((s) => s.name == updateStatusDto.name)) {
            throw new BadRequestException('Duplicate Entry');
        }
        try {
            await this.prismaService.status.update({
                where: {
                    id: id,
                },
                data: {
                    name: updateStatusDto.name,
                },
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
