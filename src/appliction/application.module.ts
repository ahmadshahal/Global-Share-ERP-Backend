import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { GoogleDriveModule } from 'src/utils/googleDrive/googleDrive.module';

@Module({
    controllers: [ApplicationController],
    providers: [ApplicationService],
    imports: [GoogleDriveModule],
})
export class ApplicationModule {}
