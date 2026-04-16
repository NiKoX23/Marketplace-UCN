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
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard, JwtAuthGuard, GoogleAuthGuard } from './guards/auth.guards';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // ─── Login local (RUT o email + password) ───────────────────────────────

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: any) {
    const tokens = this.authService.login(req.user);
    return { ok: true, ...tokens };
  }

  // ─── Registro ────────────────────────────────────────────────────────────

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: any) {
    if (!body.nombre || !body.apellido || !body.email || !body.password || !body.username) {
      throw new BadRequestException('Faltan campos obligatorios');
    }
    
    // Ensure username starts with @
    let finalUsername = body.username.trim();
    if (!finalUsername.startsWith('@')) {
      finalUsername = '@' + finalUsername;
    }

    try {
      const result = await this.authService.register({
        username: finalUsername,
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        rut: body.rut,
        password: body.password,
      });
      return { ok: true, ...result };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new BadRequestException('Error al registrar usuario');
    }
  }

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
    const tokens = this.authService.loginGoogle(req.user);
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');

    // Redirect HTTP 302 real → el navegador va al frontend con los tokens en la URL
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    return res.redirect(redirectUrl);
  }
}