import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DriveModule } from 'src/drive/drive.module';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [DriveModule],
})
export class UserModule {}
