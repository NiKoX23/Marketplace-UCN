import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private usuariosService: UsuariosService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, emails, name } = profile;
    const email = emails?.[0]?.value ?? '';
    const nombre = name?.givenName ?? '';
    const apellido = name?.familyName ?? '';

    try {
      const usuario = await this.usuariosService.findOrCreateGoogle({
        googleId: id,
        email,
        nombre,
        apellido,
      });
      done(null, usuario);
    } catch (err) {
      done(err, false);
    }
  }
}
