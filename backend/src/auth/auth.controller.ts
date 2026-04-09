import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(body.rut, body.contraseña);
    }

    @Post('refresh')
    refresh(@Body() body: any) {
        return this.authService.refresh(body.token);
    }

    @Post('logout')
    logout(@Body() body: any) {
        return this.authService.logout(body.token);
    }

    @UseGuards(JwtGuard)
    @Get('perfil')
    perfil(@Req() req) {
        return { usuario: req.user };
    }
}