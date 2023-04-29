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
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @HttpCode(HttpStatus.OK)
    @Get('profile')
    async profile(@UserId() id: number) {
        return await this.userService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.readOne(id);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    async readAll() {
        return await this.userService.readAll();
    }

    @HttpCode(HttpStatus.OK)
    @Post()
    async update(@UserId() id: number, @Body() updateUserDto: UpdateUserDto) {
        await this.userService.update(id, updateUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.userService.delete(id);
    }
}
