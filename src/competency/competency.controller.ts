import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Query,
} from '@nestjs/common';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('competency')
export class CompetencyController {
    constructor(private readonly competencyService: CompetencyService) {}

    @Post()
    async create(@Body() createCompetencyDto: CreateCompetencyDto) {
        return await this.competencyService.create(createCompetencyDto);
    }

    @Get()
    async readAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number) {
        return await this.competencyService.readAll(skip, take);
    }

    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.competencyService.readOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCompetencyDto: UpdateCompetencyDto,
    ) {
        return await this.competencyService.update(id, updateCompetencyDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.competencyService.delete(id);
    }
}
