import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('position')
export class PositionController {
    constructor(private positionService: PositionService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll() {
        return await this.positionService.readAll();
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.positionService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createPositionDto: CreatePositionDto) {
        await this.positionService.create(createPositionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePositionDto: UpdatePositionDto,
    ) {
        await this.positionService.update(id, updatePositionDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.positionService.delete(id);
    }
}
