import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { GsStatus, GsLevel, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { exclude } from 'src/utils/utils';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon from 'argon2';
import { FilterUserDto } from './dto/filter-user.dto';
import { DriveService } from 'src/drive/drive.service';
import { PassThrough } from 'stream';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
        private driveService: DriveService,
    ) {}

    async readOne(id: number, loggedUserId: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: id,
            },
            include: {
                positions: {
                    include: {
                        position: {
                            include: {
                                squad: true,
                            },
                        },
                    },
                },
                role: {
                    include: {
                        permissions: true,
                    },
                },
                requests: true,
            },
        });
        if (!user) {
            throw new NotFoundException('User Not Found');
        }
        return loggedUserId === id
            ? exclude(user, ['password'])
            : exclude(user, [
                  'password',
                  'additionalEmail',
                  'phoneNumber',
                  'cv',
                  'middleName',
              ]);
    }

    async readAll(filters: FilterUserDto, skip: number = 0, take: number = 0) {
        const { status, positions, level, squads, search } = filters;
        const [users, count] = await this.prismaService.$transaction([
            this.prismaService.user.findMany({
                where: {
                    AND: [
                        {
                            gsStatus: status
                                ? {
                                      in: status
                                          ?.split(',')
                                          .map((value) => GsStatus[value]),
                                  }
                                : undefined,
                        },
                        {
                            positions: {
                                some: positions
                                    ? {
                                          positionId: {
                                              in: positions
                                                  ?.split(',')
                                                  .map((value) => +value),
                                          },
                                      }
                                    : level
                                    ? {
                                          position: {
                                              gsLevel: {
                                                  in: level
                                                      ?.split(',')
                                                      .map(
                                                          (value) =>
                                                              GsLevel[value],
                                                      ),
                                              },
                                          },
                                      }
                                    : squads
                                    ? {
                                          position: {
                                              squadId: {
                                                  in: squads
                                                      ?.split(',')
                                                      .map((value) => +value),
                                              },
                                          },
                                      }
                                    : undefined,
                            },
                        },
                        {
                            OR: [
                                {
                                    fullName: {
                                        contains: search,
                                    },
                                },
                                {
                                    firstName: {
                                        contains: search,
                                    },
                                },
                                {
                                    lastName: {
                                        contains: search,
                                    },
                                },
                                {
                                    middleName: {
                                        contains: search,
                                    },
                                },
                                {
                                    arabicFullName: {
                                        contains: search,
                                    },
                                },
                            ],
                        },
                    ],
                },
                include: {
                    positions: {
                        include: {
                            position: {
                                include: {
                                    squad: true,
                                },
                            },
                        },
                    },
                },
                skip: skip,
                take: take == 0 ? undefined : take,
            }),
            this.prismaService.user.count({
                where: {
                    AND: [
                        {
                            gsStatus: status
                                ? {
                                      in: status
                                          ?.split(',')
                                          .map((value) => GsStatus[value]),
                                  }
                                : undefined,
                        },
                        {
                            positions: {
                                some: positions
                                    ? {
                                          positionId: {
                                              in: positions
                                                  ?.split(',')
                                                  .map((value) => +value),
                                          },
                                      }
                                    : level
                                    ? {
                                          position: {
                                              gsLevel: {
                                                  in: level
                                                      ?.split(',')
                                                      .map(
                                                          (value) =>
                                                              GsLevel[value],
                                                      ),
                                              },
                                          },
                                      }
                                    : squads
                                    ? {
                                          position: {
                                              squadId: {
                                                  in: squads
                                                      ?.split(',')
                                                      .map((value) => +value),
                                              },
                                          },
                                      }
                                    : undefined,
                            },
                        },
                        {
                            OR: [
                                {
                                    fullName: {
                                        contains: search,
                                    },
                                },
                                {
                                    firstName: {
                                        contains: search,
                                    },
                                },
                                {
                                    lastName: {
                                        contains: search,
                                    },
                                },
                                {
                                    middleName: {
                                        contains: search,
                                    },
                                },
                                {
                                    arabicFullName: {
                                        contains: search,
                                    },
                                },
                            ],
                        },
                    ],
                },
            }),
        ]);
        const editedUser = users.map((user) => exclude(user, ['password']));
        return {
            data: editedUser,
            count,
        };
    }

    async create(userId: number, createUserDto: CreateUserDto) {
        try {
            const positions = createUserDto.positions.map((position) => {
                return {
                    positionId: position.positionId,
                    startDate: position.startDate ?? new Date(),
                    endDate: position.endDate ?? null,
                };
            });
            const role = await this.prismaService.role.findUnique({
                where: {
                    id: createUserDto.roleId,
                },
            });
            const requester = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    role: true,
                },
            });
            if (!role) {
                throw new BadRequestException('Role not found..');
            }
            if (!requester) {
                throw new BadRequestException('User not found..');
            }
            if (role.name == 'Admin' && requester.role.name != 'Admin') {
                throw new BadRequestException(
                    'You do not have the required permissions',
                );
            }
            const password = await argon.hash(createUserDto.password);
            const user = await this.prismaService.user.create({
                data: {
                    email: createUserDto.email,
                    roleId: createUserDto.roleId,
                    password: password,
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    fullName:
                        createUserDto.firstName?.trim() +
                        ' ' +
                        createUserDto.lastName?.trim() +
                        ' ',
                    gsStatus: GsStatus.ACTIVE,
                    positions: {
                        createMany: {
                            data: positions,
                        },
                    },
                },
                include: {
                    positions: {
                        include: {
                            position: {
                                include: {
                                    squad: true,
                                },
                            },
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
                if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
                    throw new BadRequestException('Email already exists');
                }
            }
            throw error;
        }
    }

    async update(
        userId: number,
        id: number,
        updateUserDto: UpdateUserDto,
        cv: Express.Multer.File = null,
    ) {
        try {
            if (updateUserDto.roleId) {
                const role = await this.prismaService.role.findUnique({
                    where: {
                        id: updateUserDto.roleId,
                    },
                });
                const requester = await this.prismaService.user.findUnique({
                    where: {
                        id: userId,
                    },
                    include: {
                        role: true,
                    },
                });
                if (!role) {
                    throw new BadRequestException('Role not found..');
                }
                if (!requester) {
                    throw new BadRequestException('User not found..');
                }
                if (role.name == 'Admin' && requester.role.name != 'Admin') {
                    throw new BadRequestException(
                        'You do not have the required permissions',
                    );
                }
            }
            const user = await this.prismaService.user.findUnique({
                where: { id },
                include: {
                    positions: true,
                },
            });
            let cvUrl = user.cv;
            if (cv) {
                const resource = await this.driveService.saveFile(
                    updateUserDto.firstName ?? user.firstName,
                    new PassThrough().end(cv.buffer),
                    cv.mimetype,
                );
                cvUrl =
                    resource.data.webViewLink || resource.data.webContentLink;
            }
            const firstName = updateUserDto.firstName ?? user.firstName;
            const middleName = updateUserDto.middleName ?? user.middleName;
            const lastName = updateUserDto.lastName ?? user.lastName;
            const fullName =
                firstName.trim() +
                ' ' +
                (middleName.trim() ?? ' ') +
                ' ' +
                lastName.trim();
            const newUser = await this.prismaService.user.update({
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
                    fullName: fullName || undefined,
                    phoneNumber: updateUserDto.phoneNumber,
                    gsStatus: updateUserDto.gsStatus,
                    roleId: updateUserDto.roleId,
                    cv: cvUrl,
                    positions: {
                        deleteMany: {
                            userId: updateUserDto.positions ? user.id : -1,
                        },
                        createMany: {
                            data:
                                updateUserDto.positions?.map((position) => ({
                                    positionId: position.positionId,
                                    startDate: new Date(),
                                })) ?? [],
                        },
                    },
                },
                include: {
                    role: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });
            return exclude(newUser, ['password']);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('User Not Found');
                }
                if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
                    throw new BadRequestException(
                        'Phone Number or email already exists',
                    );
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

    @Cron('0 0 1 1,4,7,10 *')
    async addHeartsAndFreezeCards() {
        console.log('adding cards at' + new Date().toDateString());
        // await this.prismaService.user.updateMany({
        //     data: {
        //         heartsCount: { increment: 3 },
        //     },
        // });
        // await this.prismaService.user.updateMany({
        //     where: {
        //         freezeCardsCount: { lt: 6 },
        //     },
        //     data: {
        //         freezeCardsCount: { increment: 1 },
        //     },
        // });
    }

    // @Cron('0 0 1 1,4,7,10 *')
    // async checkFreezedVolunteers() {
    //     await this.prismaService.user.updateMany({
    //         where: {
    //         },
    //         data: {
    //             heartsCount: { increment: 3 },
    //         },
    //     });
    // }
}
