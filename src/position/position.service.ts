import { Injectable, NotFoundException } from '@nestjs/common';
import { Position, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Position> {
        const position = await this.prismaService.position.findFirst({
            where: {
                id: id,
            },
        });
        if (!position) {
            throw new NotFoundException('Position Not Found');
        }
        return position;
    }

    async readAll(): Promise<Position[]> {
        return await this.prismaService.position.findMany();
    }

    async create(createPositionDto: CreatePositionDto) {
        await this.prismaService.position.create({
            data: {
                name: createPositionDto.name,
                gsName: createPositionDto.gsName,
                gsLevel: createPositionDto.gsLevel,
                jobDescription: createPositionDto.jobDescription,
                weeklyHours: createPositionDto.weeklyHours,
                squadId: createPositionDto.squadId,
            },
        });
    }

    async delete(id: number) {
        try {
            await this.prismaService.position.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Position Not Found');
                }
            }
            throw error;
        }
    }

    async update(id: number, updatePositionDto: UpdatePositionDto) {
        try {
            await this.prismaService.position.update({
                where: {
                    id: id,
                },
                data: {
                    name: updatePositionDto.name,
                    gsName: updatePositionDto.gsName,
                    gsLevel: updatePositionDto.gsLevel,
                    jobDescription: updatePositionDto.jobDescription,
                    weeklyHours: updatePositionDto.weeklyHours,
                    squadId: updatePositionDto.squadId,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Position Not Found');
                }
            }
            throw error;
        }
    }
}
