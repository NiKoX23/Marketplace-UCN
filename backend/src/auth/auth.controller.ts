import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard, GoogleAuthGuard } from './guards/auth.guards';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}


  // ─── Refresh token ───────────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { token: string }) {
    const result = this.authService.refresh(body.token);
    if ('ok' in result) return { ok: false, mensaje: 'Token inválido o expirado' };
    return { ok: true, ...result };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() body: { token: string }) {
    return this.authService.logout(body.token);
  }

  // ─── Perfil (protegido por JWT) ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  perfil(@Req() req: any) {
    return { ok: true, usuario: this.authService.perfilPublico(req.user) };
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  // Passport redirige automáticamente a Google — no se necesita código aquí
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
    if(!req.user) { return res.redirect(`${frontendUrl}/?error=dominio_no_permitido`)}
    const tokens = this.authService.loginGoogle(req.user);

    // Redirect HTTP 302 real → el navegador va al frontend con los tokens en la URL
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    return res.redirect(redirectUrl);
  }
}