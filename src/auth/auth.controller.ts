import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return { token: await this.authService.login(loginDto) };
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        console.log(signupDto);
        return { token: await this.authService.signup(signupDto) };
    }
}
