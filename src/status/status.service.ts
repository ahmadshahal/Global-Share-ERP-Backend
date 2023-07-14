import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number) {
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

    async readAll() {
        return await this.prismaService.status.findMany();
    }

    async create(createStatusDto: CreateStatusDto) {
        try {
            await this.prismaService.status.create({
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

    async delete(id: number) {
        const task = await this.readOne(id);
        if (task.crucial)
            throw new BadRequestException(
                'Deletion of crucial statuses is forbidden',
            );
        await this.prismaService.status.delete({
            where: {
                id: id,
            },
        });
    }

    async update(id: number, updateStatusDto: UpdateStatusDto) {
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
