import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { GsStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { exclude } from 'src/utils/utils';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async readOne(id: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id,
            },
            include: {
                positions: {
                    include: {
                        position: true,
                    },
                },
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        if (!user) {
            throw new NotFoundException('User Not Found');
        }
        return exclude(user, ['password']);
    }

    async readAll(skip: number = 0, take: number = 10) {
        const users = await this.prismaService.user.findMany({
            include: {
                positions: {
                    include: {
                        position: true,
                    },
                },
            },
            skip: skip,
            take: take == 0 ? undefined : take,
        });
        const editedUser = users.map((user) => exclude(user, ['password']));
        const count = await this.prismaService.user.count();
        return {
            data: editedUser,
            count,
        };
    }

    async create(createUserDto: CreateUserDto) {
        try {
            const positions = createUserDto.positions.map((position) => {
                return {
                    positionId: position.positionId,
                    startDate: position.startDate ?? new Date(),
                    endDate: position.endDate ?? null,
                };
            });
            const password = await argon.hash(createUserDto.password);
            const user = await this.prismaService.user.create({
                data: {
                    email: createUserDto.email,
                    roleId: createUserDto.roleId,
                    password,
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    gsStatus: GsStatus.ACTIVE,
                    positions: {
                        createMany: {
                            data: positions,
                        },
                    },
                },
            });
            return exclude(user, ['password']);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('User Not Found');
                }
            }
            throw error;
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        try {
            const user = await this.prismaService.user.update({
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
                    roleId: updateUserDto.roleId,
                },
                include: {
                    role: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });
            return exclude(user, ['password']);
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
            const user = await this.prismaService.user.delete({
                where: {
                    id: id,
                },
            });
            return exclude(user, ['password']);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('User Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new BadRequestException(
                    'Unable to delete a related User',
                );
            }
            throw error;
        }
    }
}
