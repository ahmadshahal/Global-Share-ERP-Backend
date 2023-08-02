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
    Query,
    UseGuards,
} from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AddQuestionToVacancyDto } from './dto/add-question-to-vacancy.dto';
@UseGuards(JwtGuard)
@Controller('vacancy')
export class VacancyController {
    constructor(private vacancyService: VacancyService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number) {
        return await this.vacancyService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.vacancyService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createVacancyDto: CreateVacancyDto) {
        return await this.vacancyService.create(createVacancyDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateVacancyDto: UpdateVacancyDto,
    ) {
        return await this.vacancyService.update(id, updateVacancyDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.vacancyService.delete(id);
    }

    @Get(':vacancyId/questions')
    async readQuestionsOfVacancy(
        @Param('vacancyId', ParseIntPipe) vacancyId: number,
    ) {
        return await this.vacancyService.readQuestionsOfVacancy(vacancyId);
    }

    @Post(':vacancyId/questions')
    async addQuestionToVacancy(
        @Body() addQuestionToVacancyDto: AddQuestionToVacancyDto,
        @Param('vacancyId', ParseIntPipe) vacancyId: number,
    ) {
        return await this.vacancyService.addQuestionToVacancy(
            addQuestionToVacancyDto,
            vacancyId,
        );
    }

    @Delete(':vacancyId/questions/:id')
    async deleteQuestionFromVacancy(@Param('id', ParseIntPipe) id: number) {
        return await this.vacancyService.removeQuestionFromVacancy(id);
    }
}
