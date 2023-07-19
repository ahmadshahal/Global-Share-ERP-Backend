import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { KpiService } from './kpi.service';
import { KPI } from '@prisma/client';

@Controller('kpis')
export class KpiController {
    constructor(private readonly kpiService: KpiService) {}

    @Post()
    async create(@Body() createKpiDto: CreateKpiDto): Promise<KPI> {
        return await this.kpiService.create(createKpiDto);
    }

    @Get()
    async readAll(): Promise<KPI[]> {
        return await this.kpiService.readAll();
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
