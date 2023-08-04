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
@UseGuards(JwtGuard)
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createQuestionDto: CreateQuestionDto) {
        return await this.questionService.create(createQuestionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.questionService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.questionService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ) {
        return await this.questionService.update(id, updateQuestionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.questionService.remove(id);
    }
}
