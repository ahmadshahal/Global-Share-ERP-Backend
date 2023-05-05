import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                additionalEmail: true,
                arabicFullName: true,
                lastName: true,
                middleName: true,
                phoneNumber: true,
                joinDate: true,
                appointlet: true,
                bio: true,
                gsStatus: true,
                position: true,
            },
        });
        if (!user) {
            throw new NotFoundException('User Not Found');
        }
        return user;
    }

    async readAll() {
        return await this.prismaService.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                additionalEmail: true,
                arabicFullName: true,
                lastName: true,
                middleName: true,
                phoneNumber: true,
                joinDate: true,
                appointlet: true,
                bio: true,
                gsStatus: true,
                position: true,
            },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        try {
            await this.prismaService.user.update({
                where: {
                    id: id,
                },
                data: {
                    additionalEmail: updateUserDto.additionalEmail,
                    appointlet: updateUserDto.appointlet,
                    arabicFullName: updateUserDto.arabicFullName,
                    bio: updateUserDto.bio,
                    firstName: updateUserDto.firstName,
                    lastName: updateUserDto.lastName,
                    middleName: updateUserDto.middleName,
                    phoneNumber: updateUserDto.phoneNumber,
                    gsStatus: updateUserDto.gsStatus,
                    positionId: updateUserDto.positionId,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('User Not Found');
                }
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            await this.prismaService.user.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('User Not Found');
                }
            }
            throw error;
        }
    }
}
