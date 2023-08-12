import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Position, PositionUser, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AddUserToPositionDto } from './dto/add-user-to-position.dto';
import { FilterPositionDto } from './dto/filter-position.dto';

@Injectable()
export class PositionService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Position> {
        const position = await this.prismaService.position.findUnique({
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

    async readAll(filters: FilterPositionDto, skip: number, take: number) {
        const { squads } = filters;
        const data = await this.prismaService.position.findMany({
            where: {
                squadId: squads
                    ? {
                          in: squads?.split(',').map((value) => +value),
                      }
                    : undefined,
            },
            include: {
                squad: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
        const count = await this.prismaService.position.count();
        return {
            data,
            count,
        };
    }

    async create(createPositionDto: CreatePositionDto): Promise<Position> {
        try {
            return await this.prismaService.position.create({
                data: {
                    name: createPositionDto.name,
                    gsName: createPositionDto.gsName,
                    gsLevel: createPositionDto.gsLevel,
                    weeklyHours: createPositionDto.weeklyHours,
                    squadId: createPositionDto.squadId,
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
                throw new BadRequestException(
                    'Unable to delete a related Position',
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
                    squadId: updatePositionDto.squadId,
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
                    positionId: positionId,
                    userId: addUserToPositionDto.userId,
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
                where: {
                    id,
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

    async readUsersOfPosition(
        id: number,
        skip: number = 0,
        take: number = 10,
    ): Promise<PositionUser[]> {
        return this.prismaService.positionUser.findMany({
            where: {
                positionId: id,
            },
            include: {
                user: true,
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
    }

    /*
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
    */
}
