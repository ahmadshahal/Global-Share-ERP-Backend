import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Feedback, Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class FeedbackService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
        return await this.prismaService.feedback.create({
            data: {
                name: createFeedbackDto.name,
                title: createFeedbackDto.title,
                email: createFeedbackDto.email,
                body: createFeedbackDto.body,
            },
        });
    }

    async readAll(): Promise<Feedback[]> {
        return await this.prismaService.feedback.findMany();
    }

    async readOne(id: number): Promise<Feedback> {
        const feedback = await this.prismaService.feedback.findUnique({
            where: { id },
        });
        if (!feedback) {
            throw new NotFoundException('Feedback Not Found');
        }
        return feedback;
    }

    async delete(id: number): Promise<Feedback> {
        try {
            return await this.prismaService.feedback.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Feedback Not Found');
                }
            }
            throw error;
        }
    }
}
