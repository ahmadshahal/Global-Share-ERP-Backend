import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number) {
        const comment = await this.prismaService.comment.findFirst({
            where: {
                id: id,
            },
        });
        if (!comment) {
            throw new NotFoundException('Comment Not Found');
        }
        return comment;
    }

    async readAll() {
        return await this.prismaService.comment.findMany();
    }

    async create(createCommentDto: CreateCommentDto, authorId: number) {
        try {
            await this.prismaService.comment.create({
                data: {
                    content: createCommentDto.content,
                    author: {
                        connect: {
                            id: authorId,
                        },
                    },
                    task: {
                        connect: {
                            id: createCommentDto.taskId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new BadRequestException('Task or User not found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            await this.prismaService.comment.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Comment Not Found');
                }
            }
            throw error;
        }
    }

    async update(id: number, updateCommentDto: UpdateCommentDto) {
        try {
            await this.prismaService.comment.update({
                where: {
                    id: id,
                },
                data: {
                    content: updateCommentDto.content,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Comment Not Found');
                }
            }
            throw error;
        }
    }
}
