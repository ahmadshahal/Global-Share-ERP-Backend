import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post()
    async create(@Body() createQuestionDto: CreateQuestionDto) {
        return await this.questionService.create(createQuestionDto);
    }

    @Get()
    async readAll() {
        return await this.questionService.readAll();
    }

    @Get(':id')
    async readOne(@Param('id') id: string) {
        return await this.questionService.readOne(+id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ) {
        return await this.questionService.update(+id, updateQuestionDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.questionService.remove(+id);
    }
}
