import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService, CreateUsuarioDto } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/usuario.entity';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  /** Almacén en memoria de refresh tokens válidos.
   *  En producción considera moverlos a Redis o a la BD. */
  private refreshTokensValidos = new Set<string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usuariosService: UsuariosService,
  ) {}

  // ─── Tokens ──────────────────────────────────────────────────────────────

  private generarTokens(usuario: Usuario): Tokens {
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('SECRET_KEY'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('REFRESH_SECRET_KEY'),
      expiresIn: '7d',
    });

    this.refreshTokensValidos.add(refreshToken);
    return { accessToken, refreshToken };
  }

  // ─── Flujos de autenticación ──────────────────────────────────────────────

  /** Llamado después de que LocalStrategy valide las credenciales. */
  login(usuario: Usuario): Tokens {
    return this.generarTokens(usuario);
  }

  /** Registro de un nuevo usuario local. */
  async register(dto: CreateUsuarioDto): Promise<{ usuario: any } & Tokens> {
    const nuevo = await this.usuariosService.crear(dto);
    const tokens = this.generarTokens(nuevo);
    return { usuario: this.usuariosService.perfilPublico(nuevo), ...tokens };
  }

  /** Llamado después de que GoogleStrategy autentique al usuario. */
  loginGoogle(usuario: Usuario): Tokens {
    return this.generarTokens(usuario);
  }

  /** Renueva el access token usando el refresh token. */
  refresh(token: string): { accessToken: string } | { ok: false } {
    if (!this.refreshTokensValidos.has(token)) return { ok: false };

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('REFRESH_SECRET_KEY'),
      });
      const newAccess = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, rol: payload.rol },
        {
          secret: this.configService.getOrThrow('SECRET_KEY'),
          expiresIn: '15m',
        },
      );
      return { accessToken: newAccess };
    } catch {
      this.refreshTokensValidos.delete(token);
      return { ok: false };
    }
  }

  /** Revoca el refresh token (logout). */
  logout(token: string): { ok: true } {
    this.refreshTokensValidos.delete(token);
    return { ok: true };
  }

  perfilPublico(usuario: Usuario) {
    return this.usuariosService.perfilPublico(usuario);
  }
}
