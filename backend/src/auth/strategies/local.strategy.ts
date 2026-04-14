import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsuariosService } from '../../usuarios/usuarios.service';

/**
 * Estrategia local: acepta "identificador" (rut o email) + "password"
 * en el body del request.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosService: UsuariosService) {
    super({ usernameField: 'identificador', passwordField: 'password' });
  }

  async validate(identificador: string, password: string) {
    const usuario = await this.usuariosService.validarCredenciales(
      identificador,
      password,
    );
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return usuario;
  }
}
