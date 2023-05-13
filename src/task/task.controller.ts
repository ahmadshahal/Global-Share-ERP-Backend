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
    UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateTaskDto } from './dto/in/create-task.dto';
import { UpdateTaskDto } from './dto/in/update-task.dto';
import { UserId } from 'src/auth/decorator/user-id.decorator';

@UseGuards(JwtGuard)
@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll() {
        return await this.taskService.readAll();
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Get('squad/:id')
    async readBySquad(@Param('id', ParseIntPipe) squadId: number) {
        return await this.taskService.readBySquad(squadId);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(
        @UserId() userId: number,
        @Body() createTaskDto: CreateTaskDto,
    ) {
        await this.taskService.create(createTaskDto, userId);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        await this.taskService.update(id, updateTaskDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.taskService.delete(id);
    }
}
