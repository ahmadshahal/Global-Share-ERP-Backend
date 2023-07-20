import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Post()
    async create(@Body() createFeedbackDto: CreateFeedbackDto) {
        return await this.feedbackService.create(createFeedbackDto);
    }

    @Get()
    async readAll() {
        return await this.feedbackService.readAll();
    }

    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.feedbackService.readOne(id);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.feedbackService.delete(id);
    }
}
