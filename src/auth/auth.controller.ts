import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtGuard } from './guard/jwt.guard';
import { Request } from 'express';
import { exclude } from 'src/utils/utils';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        return await this.authService.signup(signupDto);
    }

    @UseGuards(JwtGuard)
    @Get('/verifyToken')
    async verifyToken(@Req() req: Request) {
        const user: { [key: string]: any } = req.user;
        return exclude(user, ['password']);
    }
}
