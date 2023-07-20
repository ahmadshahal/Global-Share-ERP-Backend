import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { SquadModule } from './squad/squad.module';
import { PositionModule } from './position/position.module';
import { TaskModule } from './task/task.module';
import { StatusModule } from './status/status.module';
import { CommentModule } from './comment/comment.module';
import { RequestModule } from './request/request.module';
import { CompetencyModule } from './competency/competency.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { QuestionModule } from './question/question.module';
import { RecruitmentFeedbackModule } from './recruitmentFeedback/recruitment-feedback.module';
import { KpiModule } from './KPI/kpi.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ApplicationModule } from './appliction/application.module';
import { EmailModule } from './email/email.module';
import { VacancyModule } from './vacancy/vacancy.module';

@Module({
    imports: [
        PrismaModule,
        UserModule,
        AuthModule,
        SquadModule,
        JwtModule.register({ global: true }),
        ConfigModule.forRoot({ isGlobal: true }),
        PositionModule,
        TaskModule,
        StatusModule,
        CommentModule,
        RequestModule,
        CompetencyModule,
        EvaluationModule,
        QuestionModule,
        RecruitmentFeedbackModule,
        KpiModule,
        FeedbackModule,
        ApplicationModule,
        EmailModule,
        VacancyModule,
    ],
})
export class AppModule {}
