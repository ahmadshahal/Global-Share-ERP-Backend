import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
    Put,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Request } from '@prisma/client';
@UseGuards(JwtGuard)
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestService.create(createRequestDto);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async findAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return this.requestService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRequestDto: UpdateRequestDto,
    ) {
        return this.requestService.update(id, updateRequestDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.remove(id);
    }
}
