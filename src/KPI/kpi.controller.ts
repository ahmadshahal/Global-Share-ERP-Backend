import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { KpiService } from './kpi.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Action } from '@prisma/client';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('kpis')
export class KpiController {
    constructor(private readonly kpiService: KpiService) {}

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'KPI' })
    @Post()
    async create(@Body() createKpiDto: CreateKpiDto) {
        return await this.kpiService.create(createKpiDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'KPI' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.kpiService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'KPI' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.kpiService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'KPI' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateKpiDto: UpdateKpiDto,
    ) {
        return await this.kpiService.update(id, updateKpiDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'KPI' })
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.kpiService.remove(id);
    }
}
