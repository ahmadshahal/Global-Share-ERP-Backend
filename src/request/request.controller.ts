import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
@UseGuards(JwtGuard)
@Controller('request')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @Post()
    create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestService.create(createRequestDto);
    }

    @Get()
    findAll() {
        return this.requestService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.requestService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateRequestDto: UpdateRequestDto,
    ) {
        return this.requestService.update(+id, updateRequestDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.requestService.remove(+id);
    }
}
