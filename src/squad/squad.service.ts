import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DriveService } from 'src/drive/drive.service';
import { PassThrough } from 'stream';
import { FilterSquadDto } from './dto/filter-squad.dto';

@Injectable()
export class SquadService {
    constructor(
        private prismaService: PrismaService,
        private readonly driveService: DriveService,
    ) {}
    async readOne(id: number) {
        const squad = await this.prismaService.squad.findUnique({
            where: {
                id: id,
            },
            include: {
                positions: true,
            },
        });
        if (!squad) {
            throw new NotFoundException('Squad Not Found');
        }
        return squad;
    }

    async readAll(filters: FilterSquadDto, skip: number, take: number) {
        const { search } = filters;
        const [data, count] = await this.prismaService.$transaction([
            this.prismaService.squad.findMany({
                where: {
                    OR: search
                        ? [
                              {
                                  name: {
                                      contains: search,
                                  },
                              },
                              {
                                  gsName: {
                                      contains: search,
                                  },
                              },
                          ]
                        : undefined,
                },
                include: {
                    positions: {
                        include: {
                            users: {
                                include: {
                                    user: true,
                                },
                            },
                            vacancies: {
                                where: { isOpen: true },
                            },
                        },
                    },
                },
                skip: skip,
                take: take == 0 ? undefined : take,
            }),
            this.prismaService.squad.count({
                where: {
                    OR: search
                        ? [
                              {
                                  name: {
                                      contains: search,
                                  },
                              },
                              {
                                  gsName: {
                                      contains: search,
                                  },
                              },
                          ]
                        : undefined,
                },
            }),
        ]);
        return {
            data,
            count,
        };
    }

    async create(createSquadDto: CreateSquadDto, image: Express.Multer.File) {
        const resource = await this.driveService.saveFile(
            createSquadDto.gsName,
            new PassThrough().end(image.buffer),
            image.mimetype,
        );
        return await this.prismaService.squad.create({
            data: {
                name: createSquadDto.name,
                gsName: createSquadDto.gsName,
                description: createSquadDto.description,
                imageUrl:
                    resource.data.webViewLink || resource.data.webContentLink,
                statuses: {
                    createMany: {
                        data: [
                            { name: 'Todo', crucial: true },
                            { name: 'InProgress', crucial: true },
                            { name: 'Done', crucial: true },
                            { name: 'Approved', crucial: true },
                        ],
                    },
                },
            },
        });
    }

    async delete(id: number) {
        try {
            await this.prismaService.status.deleteMany({
                where: {
                    squad: {
                        id: id,
                    },
                },
            });
            return await this.prismaService.squad.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Squad Not Found');
                }
                if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                    throw new BadRequestException(
                        'Unable to delete a related squad or related statuses',
                    );
                }
            }
            throw error;
        }
    }

    async update(
        id: number,
        updateSquadDto: UpdateSquadDto,
        image: Express.Multer.File,
    ) {
        try {
            const squad = await this.prismaService.squad.findUnique({
                where: { id },
            });
            let imageUrl = squad.imageUrl;
            if (image) {
                const resource = await this.driveService.saveFile(
                    updateSquadDto.gsName,
                    new PassThrough().end(image.buffer),
                    image.mimetype,
                );
                imageUrl =
                    resource.data.webViewLink || resource.data.webContentLink;
            }
            return await this.prismaService.squad.update({
                where: {
                    id: id,
                },
                data: {
                    name: updateSquadDto.name,
                    description: updateSquadDto.description,
                    gsName: updateSquadDto.gsName,
                    imageUrl: imageUrl,
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
}
