import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('application')
export class ApplicationController {
    constructor(private applicationService: ApplicationService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll() {
        return await this.applicationService.readAll();
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.applicationService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createApplicationDto: CreateApplicationDto) {
        await this.applicationService.create(createApplicationDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateApplicationDto: UpdateApplicationDto,
    ) {
        await this.applicationService.update(id, updateApplicationDto);
    }

    // @HttpCode(HttpStatus.OK)
    // @Delete(':id')
    // async delete(@Param('id', ParseIntPipe) id: number) {
    //     await this.applicationService.delete(id);
    // }
}
