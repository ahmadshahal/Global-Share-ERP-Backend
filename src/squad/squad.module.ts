import { Module } from '@nestjs/common';
import { SquadService } from './squad.service';
import { SquadController } from './squad.controller';
import { GoogleDriveModule } from 'src/utils/googleDrive/googleDrive.module';

@Module({
    providers: [SquadService],
    controllers: [SquadController],
    imports: [GoogleDriveModule],
})
export class SquadModule {}
