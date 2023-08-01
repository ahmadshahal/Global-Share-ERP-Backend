import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleDriveService } from 'src/utils/googleDrive/googleDrive.service';
import { PassThrough } from 'stream';

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
        const imageStream = new PassThrough();
        const res = await this.googleDrive.saveFile(
            createSquadDto.gsName,
            imageStream.end(image.buffer),
            image.mimetype,
        );
        await this.prismaService.squad.create({
            data: {
                name: createSquadDto.name,
                gsName: createSquadDto.gsName,
                description: createSquadDto.description,
                imageUrl: res.data.webViewLink || res.data.webContentLink,
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
                if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                    throw new HttpException(
                        'Unable to delete a related squad',
                        HttpStatus.BAD_REQUEST,
                        { description: 'Bad Request' },
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
            if (image) {
                const imageStream = new PassThrough();
                const res = await this.googleDrive.saveFile(
                    updateSquadDto.gsName,
                    imageStream.end(image.buffer),
                    image.mimetype,
                );
                updateSquadDto.imageUrl =
                    res.data.webViewLink || res.data.webContentLink;
            }
            const data: any = {
                name: updateSquadDto.name,
                gsName: updateSquadDto.gsName,
                description: updateSquadDto.description,
            };
            if (updateSquadDto.imageUrl) {
                data.imageUrl = updateSquadDto.imageUrl;
            }
            await this.prismaService.squad.update({
                where: {
                    id: id,
                },
                data,
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
