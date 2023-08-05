import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Prisma, Comment } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number): Promise<Comment> {
        const comment = await this.prismaService.comment.findUnique({
            where: {
                id: id,
            },
            include: {
                task: true,
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!comment) {
            throw new NotFoundException('Comment Not Found');
        }
        return comment;
    }

    async readAll(skip: number = 0, take: number = 10): Promise<Comment[]> {
        return await this.prismaService.comment.findMany({
            include: {
                task: true,
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
    }

    async create(
        createCommentDto: CreateCommentDto,
        authorId: number,
    ): Promise<Comment> {
        try {
            return await this.prismaService.comment.create({
                data: {
                    content: createCommentDto.content,
                    authorId: authorId,
                    taskId: createCommentDto.taskId
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

    async delete(id: number): Promise<Comment> {
        try {
            return await this.prismaService.comment.delete({
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

    async update(
        id: number,
        updateCommentDto: UpdateCommentDto,
    ): Promise<Comment> {
        try {
            return await this.prismaService.comment.update({
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
