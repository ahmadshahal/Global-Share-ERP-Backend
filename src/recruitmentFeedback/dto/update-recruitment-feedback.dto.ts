import { PartialType } from '@nestjs/mapped-types';
import { CreateRecruitmentFeedbackDto } from './create-recruitment-feedback.dto';

export class UpdateRecruitmentFeedbackDto extends PartialType(
    CreateRecruitmentFeedbackDto,
) {}
