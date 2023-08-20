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
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { UserId } from 'src/auth/decorator/user-id.decorator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('status')
export class StatusController {
    constructor(private statusService: StatusService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Status' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.statusService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Status' })
    @Get('squad/:squadId')
    async readBySquad(
        @Param('squadId', ParseIntPipe) squadId: number,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.statusService.readBySquad(squadId, skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Status' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.statusService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Status' })
    @Post()
    async create(
        @UserId() userId: number,
        @Body() createStatusDto: CreateStatusDto,
    ) {
        return await this.statusService.create(userId, createStatusDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Status' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateStatusDto,
    ) {
        return await this.statusService.update(id, updateStatusDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Status' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.statusService.delete(id);
    }
}
