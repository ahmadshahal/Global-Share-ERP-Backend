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
import { UserService } from './user.service';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthorizationGuard } from 'src/auth/guard/authorization.guard';
import { Action } from '@prisma/client';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { jobDescriptionFileValidator } from 'src/position/validator/job-description-file.validator';

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'User' })
    @Get('profile')
    async profile(@UserId() id: number) {
        return await this.userService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'User' })
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'User' })
    @Get()
    async readAll(
        @Query('skip', ParseIntPipe) skip: number = 0,
        @Query('take', ParseIntPipe) take: number = 0,
        @Query() filters: FilterUserDto,
    ) {
        return await this.userService.readAll(filters, skip, take);
    }

    @HttpCode(HttpStatus.OK)
    // @Permissions({ action: Action.Update, subject: 'User' })
    @UseInterceptors(FileInterceptor('cv'))
    @Put()
    async updateProfile(
        @UserId() id: number,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: jobDescriptionFileValidator,
                fileIsRequired: false,
            }),
        )
        cv: Express.Multer.File,
    ) {
        return await this.userService.update(id, updateUserDto, cv);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'User' })
    @Put(':id')
    async update(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return await this.userService.update(userId, id, updateUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'User' })
    @Post()
    async create(@UserId() userId: number, @Body() createUserDto: CreateUserDto) {
        return await this.userService.create(userId, createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'User' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.delete(id);
    }
}
