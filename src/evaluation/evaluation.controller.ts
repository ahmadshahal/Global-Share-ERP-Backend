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
    create(@Body() createEvaluationDto: CreateEvaluationDto) {
        return this.evaluationService.create(createEvaluationDto);
    }

    @Get()
    findAll() {
        return this.evaluationService.readAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.evaluationService.readOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateEvaluationDto: UpdateEvaluationDto,
    ) {
        return this.evaluationService.update(+id, updateEvaluationDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.evaluationService.remove(+id);
    }
}
