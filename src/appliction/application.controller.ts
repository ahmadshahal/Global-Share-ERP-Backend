import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
// import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { Action } from '@prisma/client';
import { authorizationGuard } from 'src/auth/guard/authorization.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtGuard, authorizationGuard)
@Controller('application')
export class ApplicationController {
    constructor(private applicationService: ApplicationService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Application' })
    @Get()
    async readAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number) {
        return await this.applicationService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.applicationService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    // @Permissions({ action: Action.Delete, subject: 'Application' })
    @Post()
    @UseInterceptors(FilesInterceptor('files'))
    async create(
        @Body() createApplicationDto: CreateApplicationDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        console.log(files);
        return createApplicationDto;
        return await this.applicationService.create(createApplicationDto);
    }

    // @HttpCode(HttpStatus.OK)
    // @Post(':id')
    // async update(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body() updateApplicationDto: UpdateApplicationDto,
    // ) {
    //     await this.applicationService.update(id, updateApplicationDto);
    // }

    // @HttpCode(HttpStatus.OK)
    // @Delete(':id')
    // async delete(@Param('id', ParseIntPipe) id: number) {
    //     await this.applicationService.delete(id);
    // }
}
