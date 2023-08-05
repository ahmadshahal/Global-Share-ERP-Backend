import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';
import { addYears } from 'src/utils/utils';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto): Promise<string> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: loginDto.email,
            },
        });
        if (!user) {
            throw new BadRequestException('Credentials Incorrect');
        }
        const passwordsMatch = await argon.verify(
            user.password,
            loginDto.password,
        );
        if (!passwordsMatch) {
            throw new BadRequestException('Wrong Password');
        }
        return await this.signToken(user.id, user.email);
    }

    async signup(signupDto: SignupDto): Promise<string> {
        const hashedPassword = await argon.hash(signupDto.password);
        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: signupDto.email,
                    password: hashedPassword,
                    phoneNumber: signupDto.phoneNumber,
                    firstName: signupDto.firstName,
                    lastName: signupDto.lastName,
                    roleId: signupDto.roleId,
                    positions: {
                        createMany: {
                            data: [
                                {
                                    positionId: signupDto.positionId,
                                    startDate: new Date(),
                                    endDate: addYears(new Date(), 4),
                                }
                            ]
                        }
                    }
                },
            });
            return await this.signToken(user.id, user.email);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
                    throw new BadRequestException('Credentials Taken');
                }
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new BadRequestException('Position Not Found');
                }
            }
            throw error;
        }
    }

    private signToken(userId: number, email: string): Promise<string> {
        const payload = {
            sub: userId,
            email,
        };
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '7d',
        });
    }
}
