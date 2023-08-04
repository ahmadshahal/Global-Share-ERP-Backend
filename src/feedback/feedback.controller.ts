import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createFeedbackDto: CreateFeedbackDto) {
        return await this.feedbackService.create(createFeedbackDto);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.feedbackService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.feedbackService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.feedbackService.delete(id);
    }
}
