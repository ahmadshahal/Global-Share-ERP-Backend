import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { DriveService } from 'src/drive/drive.service';

@Module({
    controllers: [PositionController],
    providers: [PositionService, DriveService],
})
export class PositionModule {}
