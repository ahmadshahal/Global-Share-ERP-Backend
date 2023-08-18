import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Position, PositionUser, Prisma, GsLevel } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AddUserToPositionDto } from './dto/add-user-to-position.dto';
import { FilterPositionDto } from './dto/filter-position.dto';
import { DriveService } from 'src/drive/drive.service';
import { PassThrough } from 'stream';

@Injectable()
export class PositionService {
    constructor(
        private prismaService: PrismaService,
        private driveService: DriveService,
    ) {}

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
        const { squads, level, search } = filters;
        const [data, count] = await this.prismaService.$transaction([
            this.prismaService.position.findMany({
                where: {
                    AND: [
                        {
                            squadId: squads
                                ? {
                                      in: squads
                                          ?.split(',')
                                          .map((value) => +value),
                                  }
                                : undefined,
                        },
                        {
                            gsLevel: level
                                ? {
                                      in: level
                                          ?.split(',')
                                          .map((value) => GsLevel[value]),
                                  }
                                : undefined,
                        },
                        {
                            OR: search
                                ? [
                                      {
                                          name: { contains: search },
                                          gsName: { contains: search },
                                      },
                                  ]
                                : undefined,
                        },
                    ],
                },
                include: {
                    squad: true,
                },
                skip: skip,
                take: take == 0 ? undefined : take,
            }),
            this.prismaService.position.count({
                where: {
                    AND: [
                        {
                            squadId: squads
                                ? {
                                      in: squads
                                          ?.split(',')
                                          .map((value) => +value),
                                  }
                                : undefined,
                        },
                        {
                            gsLevel: level
                                ? {
                                      in: level
                                          ?.split(',')
                                          .map((value) => GsLevel[value]),
                                  }
                                : undefined,
                        },
                        {
                            OR: search
                                ? [
                                      {
                                          name: { contains: search },
                                          gsName: { contains: search },
                                      },
                                  ]
                                : undefined,
                        },
                    ],
                },
            }),
        ]);
        return {
            data,
            count,
        };
    }

    async create(
        createPositionDto: CreatePositionDto,
        jobDescription: Express.Multer.File,
    ): Promise<Position> {
        try {
            const resource = await this.driveService.saveFile(
                createPositionDto.gsName,
                new PassThrough().end(jobDescription.buffer),
                jobDescription.mimetype,
            );
            return await this.prismaService.position.create({
                data: {
                    name: createPositionDto.name,
                    gsName: createPositionDto.gsName,
                    gsLevel: createPositionDto.gsLevel,
                    weeklyHours: createPositionDto.weeklyHours,
                    squadId: createPositionDto.squadId,
                    jobDescription:
                        resource.data.webViewLink ||
                        resource.data.webContentLink,
                },
                include: {
                    squad: true,
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
        jobDescription: Express.Multer.File,
    ): Promise<Position> {
        try {
            const position = await this.prismaService.position.findUnique({
                where: { id },
            });
            let jobDescriptionUrl = position.jobDescription;
            if (jobDescription) {
                const resource = await this.driveService.saveFile(
                    updatePositionDto.gsName,
                    new PassThrough().end(jobDescription.buffer),
                    jobDescription.mimetype,
                );
                jobDescriptionUrl =
                    resource.data.webViewLink || resource.data.webContentLink;
            }
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
                    jobDescription: jobDescriptionUrl,
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
