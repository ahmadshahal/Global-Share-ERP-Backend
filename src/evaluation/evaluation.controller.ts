import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('evaluations')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) {}

    @Post()
    async create(@Body() createEvaluationDto: CreateEvaluationDto) {
        return await this.evaluationService.create(createEvaluationDto);
    }

    @Get()
    async findAll() {
        return await this.evaluationService.readAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.evaluationService.readOne(+id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateEvaluationDto: UpdateEvaluationDto,
    ) {
        return await this.evaluationService.update(+id, updateEvaluationDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.evaluationService.remove(+id);
    }
}
