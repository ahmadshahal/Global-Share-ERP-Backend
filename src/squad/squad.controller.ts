import {
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { SquadService } from './squad.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtGuard)
@Controller('squad')
export class SquadController {
    constructor(private squadService: SquadService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll() {
        return await this.squadService.readAll();
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
                validators: [new FileTypeValidator({ fileType: 'image' })],
            }),
        )
        image: Express.Multer.File,
    ) {
        await this.squadService.create(createSquadDto, image);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSquadDto: UpdateSquadDto,
    ) {
        await this.squadService.update(id, updateSquadDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.squadService.delete(id);
    }
}
