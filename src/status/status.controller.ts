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
import { response } from 'express';

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
        try {
            await this.statusService.create(createStatusDto);
        } catch (error) {
            throw error;
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateStatusDto,
    ) {
        try {
            await this.statusService.update(id, updateStatusDto);
        } catch (error) {
            return response.json(error.message);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.statusService.delete(id);
        } catch (error) {
            throw error;
        }
    }
}
