import {
    Controller,
    Get,
    Post,
    Body,
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
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { FilterRequestDto } from './dto/filter-request-dto';
import { RequestGeneralType } from 'src/request/enums/request-general-type.enum';
import { RequestGeneralTypeValidationPipe } from './pipes/general-type.pipe';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Request' })
    @Post()
    async create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestService.create(createRequestDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Request' })
    @Get(':generalType')
    async findAll(
        @Param('generalType', RequestGeneralTypeValidationPipe)
        generalType: RequestGeneralType,
        @Query('skip') skip: number = 0,
        @Query('take') take: number = 0,
        @Query() filters: FilterRequestDto,
    ) {
        return this.requestService.readAll(generalType, filters, +skip, +take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Request' })
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Request' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRequestDto: UpdateRequestDto,
    ) {
        return this.requestService.update(id, updateRequestDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Request' })
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.remove(id);
    }
}
