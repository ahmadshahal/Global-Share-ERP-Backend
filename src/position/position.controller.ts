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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AddUserToPositionDto } from './dto/add-user-to-position.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { FilterPositionDto } from './dto/filter-position.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { jobDescriptionFileValidator } from './validator/job-description-file.validator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('position')
export class PositionController {
    constructor(private positionService: PositionService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Position' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number = 0,
        @Query('take', ParseIntPipe) take: number = 0,
        @Query() filters: FilterPositionDto,
    ) {
        return await this.positionService.readAll(filters, skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Position' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('jobDescription'))
    @Permissions({ action: Action.Create, subject: 'Position' })
    @Post()
    async create(
        @Body() createPositionDto: CreatePositionDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: jobDescriptionFileValidator,
                fileIsRequired: true,
            }),
        )
        jobDescription: Express.Multer.File,
    ) {
        return await this.positionService.create(
            createPositionDto,
            jobDescription,
        );
    }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('jobDescription'))
    @Permissions({ action: Action.Update, subject: 'Position' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePositionDto: UpdatePositionDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: jobDescriptionFileValidator,
                fileIsRequired: false,
            }),
        )
        jobDescription: Express.Multer.File,
    ) {
        return await this.positionService.update(
            id,
            updatePositionDto,
            jobDescription,
        );
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Position' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.delete(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Create, subject: 'PositionUser' })
    @Post(':positionId/user')
    async addUserToPosition(
        @Body() addUserToPositionDto: AddUserToPositionDto,
        @Param('positionId', ParseIntPipe) positionId: number,
    ) {
        return await this.positionService.addUserToPosition(
            addUserToPositionDto,
            positionId,
        );
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'PositionUser' })
    @Delete(':positionId/user/:id')
    async removeUserFromPosition(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.removeUserFromPosition(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'PositionUser' })
    @Get('/:positionId/user')
    async readUsersOfPosition(
        @Param('positionId', ParseIntPipe) positionId: number,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.positionService.readUsersOfPosition(
            positionId,
            skip,
            take,
        );
    }

    /*
    @Get(':positionId/competency')
    async readCompetenciesOfPosition(@Param('positionId') positionId: number) {
        return await this.positionService.positionCompetencies(positionId);
    }

    @Post(':positionId/competency')
    async addCompetencyToPosition(
        @Body() addCompetencyToPositionDto: AddCompetencyToPositionDto,
        @Param('positionId', ParseIntPipe) positionId: number,
    ) {
        return await this.positionService.createPositionCompetency(
            addCompetencyToPositionDto,
            positionId,
        );
    }

    @Put(':positionId/competency/:id')
    async UpdatePositionCompetency(
        @Body() updatePositionCompetencyDto: UpdatePositionCompetencyDto,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.positionService.updatePositionCompetency(
            id,
            updatePositionCompetencyDto,
        );
    }

    @Delete(':positionId/competency/:id')
    async DeletePositionCompetency(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.deletePositionCompetency(id);
    }
    */
}
