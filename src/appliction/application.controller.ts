import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { Action } from '@prisma/client';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationFilesValidator } from './validator/application.validator';
import { FilterApplicationDto } from './dto/filter-application.dto';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('application')
export class ApplicationController {
    constructor(private applicationService: ApplicationService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Application' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number = 0,
        @Query('take', ParseIntPipe) take: number = 0,
        @Query() filters: FilterApplicationDto,
    ) {
        return await this.applicationService.readAll(filters, skip, take);
    }

    @Permissions({ action: Action.Read, subject: 'Application' })
    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.applicationService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Application' })
    @Post()
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

    @Permissions({ action: Action.Update, subject: 'Application' })
    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateApplicationDto: UpdateApplicationDto,
    ) {
        return await this.applicationService.update(id, updateApplicationDto);
    }

    @Permissions({ action: Action.Delete, subject: 'Application' })
    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.applicationService.delete(id);
    }
}
