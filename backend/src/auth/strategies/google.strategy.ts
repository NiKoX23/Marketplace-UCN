import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { Rol } from '../../usuarios/usuario.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
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
    const dominiosPermitidos = this.configService.get<string>('DOMINIOS')?.split(',').map(d=> d.trim()) || [] ;
    const admins = this.configService.get<string>('ADMINS')?.split(',').map(a => a.trim()) || [] ;
    const { id, emails, name } = profile;
    const email = emails?.[0]?.value ?? '';
    const nombre = name?.givenName ?? '';
    const apellido = name?.familyName ?? '';
    const dominio = email.split("@")[1];
    const esValido = dominiosPermitidos.includes(dominio);
    const esAdmin = admins.some(admin => admin.trim() === email);
    const rol = esAdmin ? Rol.ADMIN : Rol.USER;

    if(!esValido){ return done(null,false) }
    try {
      const usuario = await this.usuariosService.findOrCreateGoogle({
        googleId: id,
        email,
        nombre,
        apellido,
        rol,
      });
      done(null, usuario);
    } catch (err) {
      done(err, false);
    }
  }
}
