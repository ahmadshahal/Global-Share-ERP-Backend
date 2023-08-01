import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaErrorCodes } from 'src/prisma/utils/prisma.error-codes.utils';

@Injectable()
export class CompetencyService {
    constructor(private readonly prismaService: PrismaService) {}
    async create(createCompetencyDto: CreateCompetencyDto) {
        return await this.prismaService.competency.create({
            data: {
                name: createCompetencyDto.name,
                description: createCompetencyDto.description,
            },
        });
    }

    async readAll() {
        return await this.prismaService.competency.findMany();
    }

    async readOne(id: number) {
        const competency = await this.prismaService.competency.findUnique({
            where: { id },
        });
        if (!competency) {
            throw new NotFoundException('Competency Not Found');
        }
        return competency;
    }

    async update(id: number, updateCompetencyDto: UpdateCompetencyDto) {
        try {
            return await this.prismaService.competency.update({
                where: { id },
                data: {
                    name: updateCompetencyDto.name,
                    description: updateCompetencyDto.description,
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
            return await this.prismaService.competency.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PrismaErrorCodes.RecordsNotFound) {
                    throw new NotFoundException('Competency Not Found');
                }
            }
            if (error.code === PrismaErrorCodes.RelationConstrainFailed) {
                throw new HttpException(
                    'Unable to delete a related Competency',
                    HttpStatus.BAD_REQUEST,
                    { description: 'Bad Request' },
                );
            }
            throw error;
        }
    }
}
