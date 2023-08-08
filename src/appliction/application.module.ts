import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
// import { DriveModule } from 'src/drive/drive.module';

@Module({
    controllers: [ApplicationController],
    providers: [ApplicationService],
    // imports: [DriveModule],
})
export class ApplicationModule {}
