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
    create(@Body() createEmailDto: CreateEmailDto) {
        return this.emailService.create(createEmailDto);
    }

    @Get()
    readAll() {
        return this.emailService.readAll();
    }

    @Get(':id')
    readOne(@Param('id', ParseIntPipe) id: number) {
        return this.emailService.readOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmailDto: UpdateEmailDto,
    ) {
        return this.emailService.update(id, updateEmailDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.emailService.delete(id);
    }
}
