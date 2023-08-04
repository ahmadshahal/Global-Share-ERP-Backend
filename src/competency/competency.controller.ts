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
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('competency')
export class CompetencyController {
    constructor(private readonly competencyService: CompetencyService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createCompetencyDto: CreateCompetencyDto) {
        return await this.competencyService.create(createCompetencyDto);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.competencyService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.competencyService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCompetencyDto: UpdateCompetencyDto,
    ) {
        return await this.competencyService.update(id, updateCompetencyDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.competencyService.delete(id);
    }
}
