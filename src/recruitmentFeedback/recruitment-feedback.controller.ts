import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
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

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(
        @Body() createRecruitmentFeedbackDto: CreateRecruitmentFeedbackDto,
    ) {
        return await this.recruitmentFeedbackService.create(
            createRecruitmentFeedbackDto,
        );
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.recruitmentFeedbackService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.recruitmentFeedbackService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRecruitmentFeedbackDto: UpdateRecruitmentFeedbackDto,
    ) {
        return await this.recruitmentFeedbackService.update(
            id,
            updateRecruitmentFeedbackDto,
        );
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.recruitmentFeedbackService.remove(id);
    }
}
