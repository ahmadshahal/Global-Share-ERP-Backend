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
    ],
})
export class AppModule {}
