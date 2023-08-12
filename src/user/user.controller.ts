import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
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
        @Query('skip') skip: number = 0,
        @Query('take') take: number = 0,
        @Query() filters: FilterUserDto,
    ) {
        return await this.userService.readAll(filters, +skip, +take);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'User' })
    @Put()
    async update(@UserId() id: number, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.update(id, updateUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Update, subject: 'User' })
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Delete, subject: 'User' })
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.delete(id);
    }
}
