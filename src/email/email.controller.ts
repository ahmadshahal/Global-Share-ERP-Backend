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
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { MailerService } from '@nestjs-modules/mailer';

@UseGuards(JwtGuard)
@Controller('email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        private readonly mailerService: MailerService,
    ) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createEmailDto: CreateEmailDto) {
        return await this.emailService.create(createEmailDto);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number,
        @Query('take', ParseIntPipe) take: number,
    ) {
        return await this.emailService.readAll(skip, take);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.emailService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmailDto: UpdateEmailDto,
    ) {
        return await this.emailService.update(id, updateEmailDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.emailService.delete(id);
    }

    @HttpCode(HttpStatus.OK)
    @Post('/send')
    async sendTestEmail() {
        return await this.mailerService
            .sendMail({
                to: ['ahmad.alshahal2@gmail.com', 'mhd.zayd.skaff@gmail.com'],
                subject: 'Welcome To Global Share Platform',
                text: 'welcome',
            })
            .then((success) => {
                return success;
            })
            .catch((error) => {
                return error;
            });
    }
}
