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
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { Action } from '@prisma/client';
import { FilterEmailDto } from './dto/filter-email.dto';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        private readonly mailerService: MailerService,
    ) {}

    @HttpCode(HttpStatus.CREATED)
    @Permissions({ action: Action.Create, subject: 'Email' })
    @Post()
    async create(@Body() createEmailDto: CreateEmailDto) {
        return await this.emailService.create(createEmailDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Email' })
    @Get()
    async readAll(
        @Query('skip') skip: number = 0,
        @Query('take') take: number = 0,
        @Query() filters: FilterEmailDto,
    ) {
        return await this.emailService.readAll(filters, +skip, +take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Email' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.emailService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'Email' })
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmailDto: UpdateEmailDto,
    ) {
        return await this.emailService.update(id, updateEmailDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'Email' })
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
