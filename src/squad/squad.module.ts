import { Module } from '@nestjs/common';
import { SquadService } from './squad.service';
import { SquadController } from './squad.controller';
// import { DriveModule } from 'src/drive/drive.module';

@Module({
    providers: [SquadService],
    controllers: [SquadController],
    // imports: [DriveModule],
})
export class SquadModule {}
