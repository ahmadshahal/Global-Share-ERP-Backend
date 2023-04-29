import { Module } from '@nestjs/common';
import { SquadService } from './squad.service';
import { SquadController } from './squad.controller';

@Module({
    providers: [SquadService],
    controllers: [SquadController],
})
export class SquadModule {}
