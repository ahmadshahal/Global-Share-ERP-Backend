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
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('status')
export class StatusController {
    constructor(private statusService: StatusService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll() {
        return await this.statusService.readAll();
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.statusService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createStatusDto: CreateStatusDto) {
        await this.statusService.create(createStatusDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateStatusDto,
    ) {
        await this.statusService.update(id, updateStatusDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.statusService.delete(id);
    }
}