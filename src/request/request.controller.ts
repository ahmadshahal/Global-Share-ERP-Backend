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

    @Post()
    create(@Body() createRequestDto: CreateRequestDto): Promise<Request> {
        return this.requestService.create(createRequestDto);
    }

    @Get()
    findAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number): Promise<Request[]> {
        return this.requestService.readAll(skip, take);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Request> {
        return this.requestService.readOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateRequestDto: UpdateRequestDto,
    ): Promise<Request> {
        return this.requestService.update(+id, updateRequestDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<Request> {
        return this.requestService.remove(+id);
    }
}
