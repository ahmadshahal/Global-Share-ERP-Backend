import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { SquadService } from './squad.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SquadImageValidator } from './validator/squad.validator';

@UseGuards(JwtGuard)
@Controller('squad')
export class SquadController {
    constructor(private squadService: SquadService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(@Query('skip', ParseIntPipe) skip: number, @Query('take', ParseIntPipe) take: number) {
        return await this.squadService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.squadService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() createSquadDto: CreateSquadDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: SquadImageValidator,
                fileIsRequired: false,
            }),
        )
        image: Express.Multer.File,
    ) {
        return await this.squadService.create(createSquadDto, image);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSquadDto: UpdateSquadDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: SquadImageValidator,
                fileIsRequired: false,
            }),
        )
        image: Express.Multer.File,
    ) {
        return await this.squadService.update(id, updateSquadDto, image);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.squadService.delete(id);
    }
}
