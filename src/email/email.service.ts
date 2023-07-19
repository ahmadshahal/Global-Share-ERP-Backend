import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Email } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class EmailService {
    constructor(private readonly prismaService: PrismaService) {}
    async create(createEmailDto: CreateEmailDto): Promise<Email> {
        const { title, body, recruitmentStatus, cc } = createEmailDto;
        return await this.prismaService.email.create({
            data: {
                title,
                body,
                recruitmentStatus,
                cc,
            },
        });
    }

    async readAll() {
        return await this.prismaService.email.findMany();
    }

    async readOne(id: number) {
        const email = await this.prismaService.email.findUnique({
            where: { id },
        });
        if (!email) {
            throw new NotFoundException('Email Not Found');
        }
        return email;
    }

    async update(id: number, updateEmailDto: UpdateEmailDto) {
        const { title, body, recruitmentStatus, cc } = updateEmailDto;

        try {
            return await this.prismaService.email.update({
                where: { id },
                data: {
                    title,
                    body,
                    recruitmentStatus,
                    cc,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Competency Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            return await this.prismaService.email.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Competency Not Found');
                }
            }
            throw error;
        }
    }
}
