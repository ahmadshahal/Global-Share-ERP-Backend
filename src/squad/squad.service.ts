import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Squad } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SquadService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Squad> {
        const squad = await this.prismaService.squad.findFirst({
            where: {
                id: id,
            },
        });
        if (!squad) {
            throw new NotFoundException('Squad Not Found');
        }
        return squad;
    }

    async readAll(): Promise<Squad[]> {
        return await this.prismaService.squad.findMany();
    }

    async create(createSquadDto: CreateSquadDto, image: Express.Multer.File) {
        // TODO: Upload the image to Google Drive and add the link in the DB.
        await this.prismaService.squad.create({
            data: {
                name: createSquadDto.name,
                gsName: createSquadDto.gsName,
                description: createSquadDto.description,
                imageUrl: image.path,
                board: {
                    create: {
                        statuses: {
                            createMany: {
                                data: [
                                    { statusId: 1 },
                                    { statusId: 2 },
                                    { statusId: 3 },
                                    { statusId: 4 },
                                ],
                            },
                        },
                    },
                },
            },
        });
    }

    async delete(id: number) {
        try {
            await this.prismaService.squad.delete({
                where: {
                    id: id,
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

    async update(id: number, updateSquadDto: UpdateSquadDto) {
        try {
            await this.prismaService.squad.update({
                where: {
                    id: id,
                },
                data: {
                    name: updateSquadDto.name,
                    gsName: updateSquadDto.gsName,
                    description: updateSquadDto.description,
                    imageUrl: updateSquadDto.imageUrl,
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
