import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
} from '@nestjs/common';
import { CreateRecruitmentFeedbackDto } from './dto/create-recruitment-feedback.dto';
import { UpdateRecruitmentFeedbackDto } from './dto/update-recruitment-feedback.dto';
import { RecruitmentFeedbackService } from './recruitment-feedback.service';

@Controller('recruitment-feedback')
export class RecruitmentFeedbackController {
    constructor(
        private readonly recruitmentFeedbackService: RecruitmentFeedbackService,
    ) {}

    @Post()
    create(@Body() createRecruitmentFeedbackDto: CreateRecruitmentFeedbackDto) {
        return this.recruitmentFeedbackService.create(
            createRecruitmentFeedbackDto,
        );
    }

    @Get()
    readAll() {
        return this.recruitmentFeedbackService.readAll();
    }

    @Get(':id')
    readOne(@Param('id') id: string) {
        return this.recruitmentFeedbackService.readOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateRecruitmentFeedbackDto: UpdateRecruitmentFeedbackDto,
    ) {
        return this.recruitmentFeedbackService.update(
            +id,
            updateRecruitmentFeedbackDto,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.recruitmentFeedbackService.remove(+id);
    }
}
