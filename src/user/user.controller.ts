import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @HttpCode(HttpStatus.OK)
    @Get('profile')
    profile(@UserId() id: number) {
        return this.userService.profile(id);
    }
}
