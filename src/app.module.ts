import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        PrismaModule,
        UserModule,
        AuthModule,
        JwtModule.register({ global: true }),
        ConfigModule.forRoot({ isGlobal: true }),
    ],
})
export class AppModule {}
