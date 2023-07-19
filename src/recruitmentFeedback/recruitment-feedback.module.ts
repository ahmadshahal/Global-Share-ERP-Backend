import { Module } from '@nestjs/common';
import { RecruitmentFeedbackService } from './recruitment-feedback.service';
import { RecruitmentFeedbackController } from './recruitment-feedback.controller';

@Module({
    controllers: [RecruitmentFeedbackController],
    providers: [RecruitmentFeedbackService],
})
export class RecruitmentFeedbackModule {}
