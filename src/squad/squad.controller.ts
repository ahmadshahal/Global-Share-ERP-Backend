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
    Put,
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
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('squad')
export class SquadController {
    constructor(private squadService: SquadService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Squad' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.squadService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Squad' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.squadService.readOne(id);
    }

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Squad' })
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() createSquadDto: CreateSquadDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: SquadImageValidator,
                fileIsRequired: true,
            }),
        )
        image: Express.Multer.File,
    ) {
        return await this.squadService.create(createSquadDto, image);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Squad' })
    @Put(':id')
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
    @Permissions({ action: Action.Delete, subject: 'Squad' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.squadService.delete(id);
    }
}
