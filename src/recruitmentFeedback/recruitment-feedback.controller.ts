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
import { CreateRecruitmentFeedbackDto } from './dto/create-recruitment-feedback.dto';
import { UpdateRecruitmentFeedbackDto } from './dto/update-recruitment-feedback.dto';
import { RecruitmentFeedbackService } from './recruitment-feedback.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('recruitment-feedback')
export class RecruitmentFeedbackController {
    constructor(
        private readonly recruitmentFeedbackService: RecruitmentFeedbackService,
    ) {}

    @Post()
    async create(
        @Body() createRecruitmentFeedbackDto: CreateRecruitmentFeedbackDto,
    ) {
        return await this.recruitmentFeedbackService.create(
            createRecruitmentFeedbackDto,
        );
    }

    @Get()
    async readAll() {
        return await this.recruitmentFeedbackService.readAll();
    }

    @Get(':id')
    async readOne(@Param('id') id: string) {
        return await this.recruitmentFeedbackService.readOne(+id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRecruitmentFeedbackDto: UpdateRecruitmentFeedbackDto,
    ) {
        return await this.recruitmentFeedbackService.update(
            +id,
            updateRecruitmentFeedbackDto,
        );
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.recruitmentFeedbackService.remove(+id);
    }
}
