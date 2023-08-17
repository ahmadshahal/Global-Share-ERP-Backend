import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ApplicationModule } from 'src/appliction/application.module';
import { SquadModule } from 'src/squad/squad.module';
import { VacancyModule } from 'src/vacancy/vacancy.module';

@Module({
    imports: [ApplicationModule, SquadModule, VacancyModule, ApplicationModule],
    controllers: [PublicController],
})
export class PublicModule {}
