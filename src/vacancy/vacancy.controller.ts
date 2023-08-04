import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('vacancy')
export class VacancyController {
    constructor(private vacancyService: VacancyService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Vacancy' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.vacancyService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Vacancy' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.vacancyService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Vacancy' })
    @Post()
    async create(@Body() createVacancyDto: CreateVacancyDto) {
        return await this.vacancyService.create(createVacancyDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Vacancy' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateVacancyDto: UpdateVacancyDto,
    ) {
        return await this.vacancyService.update(id, updateVacancyDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Vacancy' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.vacancyService.delete(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'VacancyQuestion' })
    @Get(':vacancyId/questions')
    async readQuestionsOfVacancy(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
        @Param('vacancyId', ParseIntPipe) vacancyId: number,
    ) {
        return await this.vacancyService.readQuestionsOfVacancy(
            vacancyId,
            skip,
            take,
        );
    }
}
