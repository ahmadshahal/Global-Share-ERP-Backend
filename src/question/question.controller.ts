import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { FilterQuestionDto } from './dto/filter-question.dto';
@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Question' })
    @Post()
    async create(@Body() createQuestionDto: CreateQuestionDto) {
        return await this.questionService.create(createQuestionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Question' })
    @Get()
    async readAll(
        @Query('skip') skip: number = 0,
        @Query('take') take: number = 0,
        @Query() filters: FilterQuestionDto,
    ) {
        return await this.questionService.readAll(filters, +skip, +take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Question' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.questionService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Question' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ) {
        return await this.questionService.update(id, updateQuestionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Question' })
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.questionService.remove(id);
    }
}
