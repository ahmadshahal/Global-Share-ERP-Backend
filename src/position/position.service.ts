import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    Position,
    PositionCompetency,
    PositionUser,
    Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AddUserToPositionDto } from './dto/add-user-to-position.dto';
import { AddCompetencyToPositionDto } from './dto/add-competency-to-position.dto';
import { UpdatePositionCompetencyDto } from './dto/update-competency-position.dto';

@Injectable()
export class PositionService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Position> {
        const position = await this.prismaService.position.findFirst({
            where: {
                id: id,
            },
            include: {
                squad: true,
            },
        });
        if (!position) {
            throw new NotFoundException('Position Not Found');
        }
        return position;
    }

    async readAll(): Promise<Position[]> {
        return await this.prismaService.position.findMany({
            include: {
                squad: true,
            },
        });
    }

    async create(createPositionDto: CreatePositionDto): Promise<Position> {
        try {
            return await this.prismaService.position.create({
                data: {
                    name: createPositionDto.name,
                    gsName: createPositionDto.gsName,
                    gsLevel: createPositionDto.gsLevel,
                    weeklyHours: createPositionDto.weeklyHours,
                    squad: {
                        connect: {
                            id: createPositionDto.squadId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Squad Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number): Promise<Position> {
        try {
            return await this.prismaService.position.delete({
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
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new HttpException(
                    'Unable to delete a related Position',
                    HttpStatus.BAD_REQUEST,
                    { description: 'Bad Request' },
                );
            }
            throw error;
        }
    }

    async update(
        id: number,
        updatePositionDto: UpdatePositionDto,
    ): Promise<Position> {
        try {
            return await this.prismaService.position.update({
                where: {
                    id: id,
                },
                data: {
                    name: updatePositionDto.name,
                    gsName: updatePositionDto.gsName,
                    gsLevel: updatePositionDto.gsLevel,
                    weeklyHours: updatePositionDto.weeklyHours,
                    squad: {
                        connect: {
                            id: updatePositionDto.squadId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Position or Squad Not Found');
                }
            }
            throw error;
        }
    }

    async addUserToPosition(
        addUserToPositionDto: AddUserToPositionDto,
        positionId: number,
    ): Promise<PositionUser> {
        try {
            return await this.prismaService.positionUser.create({
                data: {
                    position: {
                        connect: {
                            id: positionId,
                        },
                    },
                    user: {
                        connect: {
                            id: addUserToPositionDto.userId,
                        },
                    },
                    startDate: addUserToPositionDto.startDate,
                    endDate: addUserToPositionDto.endDate,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Error');
                }
            }
            throw error;
        }
    }

    async removeUserFromPosition(id: number): Promise<PositionUser> {
        try {
            return await this.prismaService.positionUser.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Error');
                }
            }
            throw error;
        }
    }

    async positionUsers(id: number): Promise<PositionUser[]> {
        return this.prismaService.positionUser.findMany({
            where: {
                positionId: id,
            },
            include: {
                user: true,
            },
        });
    }

    async positionCompetencies(id: number): Promise<PositionCompetency[]> {
        return await this.prismaService.positionCompetency.findMany({
            where: {
                positionId: id,
            },
            include: {
                competency: true,
            },
        });
    }

    async createPositionCompetency(
        createPositionCompetencyDto: AddCompetencyToPositionDto,
        positionId: number,
    ): Promise<PositionCompetency> {
        const { weight, competencyId } = createPositionCompetencyDto;

        return await this.prismaService.positionCompetency.create({
            data: {
                weight,
                competencyId,
                positionId,
            },
            include: {
                competency: true,
                position: true,
                evaluations: true,
            },
        });
    }

    async updatePositionCompetency(
        id: number,
        updatePositionCompetencyDto: UpdatePositionCompetencyDto,
    ): Promise<PositionCompetency> {
        const { weight } = updatePositionCompetencyDto;

        return await this.prismaService.positionCompetency.update({
            data: {
                weight,
            },
            where: {
                id,
            },
            include: {
                competency: true,
                position: true,
                evaluations: true,
            },
        });
    }

    async deletePositionCompetency(id: number): Promise<PositionCompetency> {
        const positionCompetency =
            await this.prismaService.positionCompetency.findUnique({
                where: {
                    id,
                },
                include: {
                    evaluations: true,
                },
            });

        if (!positionCompetency) {
            throw new NotFoundException(
                `PositionCompetency with ID ${id} not found`,
            );
        }

        if (positionCompetency.evaluations.length > 0) {
            throw new Error(
                `Cannot delete PositionCompetency with ID ${id} because it has associated Evaluation records`,
            );
        }

        const deletedPositionCompetency =
            await this.prismaService.positionCompetency.delete({
                where: {
                    id,
                },
                include: {
                    competency: true,
                    position: true,
                    evaluations: true,
                },
            });

        return deletedPositionCompetency;
    }
}
