import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { PrismaService } from '../prisma/prisma.service';
import { KPI, Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class KpiService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(createKpiDto: CreateKpiDto): Promise<KPI> {
        return await this.prismaService.kPI.create({
            data: {
                name: createKpiDto.name,
                description: createKpiDto.description,
            },
        });
    }

    async readAll(skip: number = 0, take: number = 10) {
        const data = await this.prismaService.kPI.findMany({
            include: {
                tasks: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
        const count = await this.prismaService.kPI.count();
        return {
            data,
            count,
        };
    }

    async readOne(id: number): Promise<KPI> {
        const kpi = await this.prismaService.kPI.findUnique({
            where: {
                id,
            },
            include: {
                tasks: true,
            },
        });
        if (!kpi) {
            throw new NotFoundException('KPI not found');
        }
        return kpi;
    }

    async update(id: number, updateKpiDto: UpdateKpiDto): Promise<KPI> {
        try {
            return await this.prismaService.kPI.update({
                where: { id },
                data: {
                    name: updateKpiDto.name,
                    description: updateKpiDto.description,
                },
                include: { tasks: true },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('KPI not found');
                }
            }
            throw error;
        }
    }

    async remove(id: number): Promise<KPI> {
        try {
            return await this.prismaService.kPI.delete({
                where: {
                    id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('KPI not found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException('Unable to delete a related KPI');
            }
            throw error;
        }
    }
}
