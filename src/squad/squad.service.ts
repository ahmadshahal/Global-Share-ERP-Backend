import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleDriveService } from 'src/utils/googleDrive/googleDrive.service';

@Injectable()
export class SquadService {
    constructor(
        private prismaService: PrismaService,
        private readonly googleDrive: GoogleDriveService,
    ) {}

    async readOne(id: number) {
        const squad = await this.prismaService.squad.findFirst({
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

    async readAll() {
        return await this.prismaService.squad.findMany({
            include: {
                positions: true,
            },
        });
    }

    async create(createSquadDto: CreateSquadDto, image: Express.Multer.File) {
        return await this.googleDrive.saveFile(
            'test1',
            image.buffer.toString(),
            image.mimetype,
        );
        // TODO: Upload the image to Google Drive and add the link in the DB.
        await this.prismaService.squad.create({
            data: {
                name: createSquadDto.name,
                gsName: createSquadDto.gsName,
                description: createSquadDto.description,
                imageUrl: 'http://image.path.com',
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

    async update(
        id: number,
        updateSquadDto: UpdateSquadDto,
        image: Express.Multer.File,
    ) {
        // TODO: Upload the image to Google Drive and add the link in the DB.
        try {
            await this.prismaService.squad.update({
                where: {
                    id: id,
                },
                data: {
                    name: updateSquadDto.name,
                    gsName: updateSquadDto.gsName,
                    description: updateSquadDto.description,
                    imageUrl: 'http://image.path.com',
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
