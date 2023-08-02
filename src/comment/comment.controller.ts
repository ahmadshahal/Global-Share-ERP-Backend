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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('comment')
export class CommentController {
    constructor(private commentService: CommentService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number) {
        return await this.commentService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.commentService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(
        @UserId() userId: number,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return await this.commentService.create(createCommentDto, userId);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCommentDto: UpdateCommentDto,
    ) {
        return await this.commentService.update(id, updateCommentDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.commentService.delete(id);
    }
}
