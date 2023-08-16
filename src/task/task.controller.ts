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
import { TaskService } from './task.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UserId } from 'src/auth/decorator/user-id.decorator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Task' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number = 0,
        @Query('take', ParseIntPipe) take: number = 0,
        @Query() filters: FilterTaskDto,
    ) {
        return await this.taskService.readAll(filters, skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Task' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Task' })
    @Get('squad/:id')
    async readBySquad(
        @Param('id', ParseIntPipe) squadId: number,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.taskService.readBySquad(squadId, skip, take);
    }

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Task' })
    @Post()
    async create(
        @UserId() userId: number,
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return await this.taskService.create(userId, createTaskDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Task' })
    @Put(':id')
    async update(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return await this.taskService.update(userId, id, updateTaskDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Task' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.delete(id);
    }
}
