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
    create(@Body() createFeedbackDto: CreateFeedbackDto) {
        return this.feedbackService.create(createFeedbackDto);
    }

    @Get()
    readAll() {
        return this.feedbackService.readAll();
    }

    @Get(':id')
    readOne(@Param('id', ParseIntPipe) id: number) {
        return this.feedbackService.readOne(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.feedbackService.delete(id);
    }
}
