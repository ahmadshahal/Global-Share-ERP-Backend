import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { KpiService } from './kpi.service';
import { KPI } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('kpis')
export class KpiController {
    constructor(private readonly kpiService: KpiService) {}

    @Post()
    async create(@Body() createKpiDto: CreateKpiDto): Promise<KPI> {
        return await this.kpiService.create(createKpiDto);
    }

    @Get()
    async readAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number): Promise<KPI[]> {
        return await this.kpiService.readAll(skip, take);
    }

    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number): Promise<KPI> {
        return await this.kpiService.readOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateKpiDto: UpdateKpiDto,
    ): Promise<KPI> {
        return await this.kpiService.update(id, updateKpiDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<KPI> {
        return await this.kpiService.remove(id);
    }
}
