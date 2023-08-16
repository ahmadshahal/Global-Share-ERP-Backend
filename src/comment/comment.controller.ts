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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('comment')
export class CommentController {
    constructor(private commentService: CommentService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Comment' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.commentService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Comment' })
    @Get(':taskId')
    async readAllByTask(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        return await this.commentService.readAllByTask(skip, take, taskId);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Comment' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.commentService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Comment' })
    @Post()
    async create(
        @UserId() userId: number,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return await this.commentService.create(createCommentDto, userId);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Comment' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCommentDto: UpdateCommentDto,
    ) {
        return await this.commentService.update(id, updateCommentDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Comment' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.commentService.delete(id);
    }
}
