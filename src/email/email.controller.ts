import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Post()
    async create(@Body() createEmailDto: CreateEmailDto) {
        return await this.emailService.create(createEmailDto);
    }

    @Get()
    async readAll() {
        return await this.emailService.readAll();
    }

    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.emailService.readOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmailDto: UpdateEmailDto,
    ) {
        return await this.emailService.update(id, updateEmailDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.emailService.delete(id);
    }
}
