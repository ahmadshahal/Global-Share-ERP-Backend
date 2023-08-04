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
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AddUserToPositionDto } from './dto/add-user-to-position.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('position')
export class PositionController {
    constructor(private positionService: PositionService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.positionService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createPositionDto: CreatePositionDto) {
        return await this.positionService.create(createPositionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePositionDto: UpdatePositionDto,
    ) {
        return await this.positionService.update(id, updatePositionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.delete(id);
    }

    @HttpCode(HttpStatus.OK)
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
    @Delete(':positionId/user/:id')
    async removeUserFromPosition(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.removeUserFromPosition(id);
    }

    @HttpCode(HttpStatus.OK)
    @Get('/:positionId/user')
    async readUsersOfPosition(
        @Param('positionId', ParseIntPipe) positionId: number,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.positionService.readUsersOfPosition(positionId, skip, take);
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
