import { Module } from '@nestjs/common';
import { GoogleDriveService } from './googleDrive.service';

@Module({
    providers: [GoogleDriveService],
    exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
