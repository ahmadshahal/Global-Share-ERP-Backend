import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { SquadService } from 'src/squad/squad.service';
import { FilterSquadDto } from 'src/squad/dto/filter-squad.dto';
import { VacancyService } from 'src/vacancy/vacancy.service';
import { FilterVacancyDto } from 'src/vacancy/dto/filter-vacancy.dto';
import { CreateApplicationDto } from 'src/appliction/dto/create-application.dto';
import { ApplicationFilesValidator } from 'src/appliction/validator/application.validator';
import { ApplicationService } from 'src/appliction/application.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('public')
export class PublicController {
    constructor(
        private squadService: SquadService,
        private vacancyService: VacancyService,
        private applicationService: ApplicationService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Get('squads')
    async readAllSquads(
        @Query('skip', ParseIntPipe) skip: number = 0,
        @Query('take', ParseIntPipe) take: number = 0,
        @Query() filters: FilterSquadDto,
    ) {
        return await this.squadService.readAll(filters, skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get('vacancies')
    async readVacancies(
        @Query('skip', ParseIntPipe) skip: number = 0,
        @Query('take', ParseIntPipe) take: number = 0,
        @Query() filters: FilterVacancyDto,
    ) {
        return await this.vacancyService.readAll(filters, skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get('vacancy/:id')
    async readVacancy(@Param('id', ParseIntPipe) id: number) {
        return await this.vacancyService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('apply')
    @UseInterceptors(FilesInterceptor('files'))
    async create(
        @Body() createApplicationDto: CreateApplicationDto,
        @UploadedFiles(
            new ParseFilePipe({
                validators: ApplicationFilesValidator,
                fileIsRequired: false,
            }),
        )
        files: Express.Multer.File[],
    ) {
        return await this.applicationService.create(
            createApplicationDto,
            files,
        );
    }
}
