import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('evaluations')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createEvaluationDto: CreateEvaluationDto) {
        return await this.evaluationService.create(createEvaluationDto);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async findAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.evaluationService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.evaluationService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEvaluationDto: UpdateEvaluationDto,
    ) {
        return await this.evaluationService.update(id, updateEvaluationDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.evaluationService.remove(id);
    }
}
