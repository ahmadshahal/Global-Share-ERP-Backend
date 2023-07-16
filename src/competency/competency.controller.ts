import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';

@Controller('competency')
export class CompetencyController {
    constructor(private readonly competencyService: CompetencyService) {}

    @Post()
    create(@Body() createCompetencyDto: CreateCompetencyDto) {
        return this.competencyService.create(createCompetencyDto);
    }

    @Get()
    readAll() {
        return this.competencyService.readAll();
    }

    @Get(':id')
    readOne(@Param('id', ParseIntPipe) id: number) {
        return this.competencyService.readOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCompetencyDto: UpdateCompetencyDto,
    ) {
        return this.competencyService.update(id, updateCompetencyDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.competencyService.delete(id);
    }
}
