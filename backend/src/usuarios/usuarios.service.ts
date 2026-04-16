import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export interface CreateUsuarioDto {
  username?: string;
  nombre: string;
  apellido: string;
  email: string;
  rut?: string;
  password?: string;
  googleId?: string;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  /** Busca por email */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { email } });
  }

  /** Busca por username */
  async findByUsername(username: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { username } });
  }

  /** Busca por RUT */
  async findByRut(rut: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { rut } });
  }

  /** Busca por Google ID */
  async findByGoogleId(googleId: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { googleId } });
  }

  /** Busca por ID */
  async findById(id: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Crea un nuevo usuario.
   * La contraseña se hashea con bcrypt (12 rondas).
   */
  async crear(dto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar unicidad de email
    const existente = await this.findByEmail(dto.email);
    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar unicidad de username si se provee
    if (dto.username) {
      const existenteUsername = await this.findByUsername(dto.username);
      if (existenteUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    // Verificar unicidad de RUT si se provee
    if (dto.rut) {
      const existenteRut = await this.findByRut(dto.rut);
      if (existenteRut) {
        throw new ConflictException('El RUT ya está registrado');
      }
    }

    const usuario = this.repo.create({
      username: dto.username ?? null,
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      rut: dto.rut ?? null,
      passwordHash: dto.password
        ? await bcrypt.hash(dto.password, SALT_ROUNDS)
        : null,
      googleId: dto.googleId ?? null,
    });

    return this.repo.save(usuario);
  }

  /**
   * Vincula o crea un usuario a través de Google OAuth.
   * Si el email ya existe, solo asocia el googleId.
   */
  async findOrCreateGoogle(profile: {
    googleId: string;
    email: string;
    nombre: string;
    apellido: string;
  }): Promise<Usuario> {
    // 1) ¿Ya existe por googleId?
    let usuario = await this.findByGoogleId(profile.googleId);
    if (usuario) return usuario;

    // 2) ¿Ya existe por email? → vincular googleId
    usuario = await this.findByEmail(profile.email);
    if (usuario) {
      usuario.googleId = profile.googleId;
      return this.repo.save(usuario);
    }

    // 3) Crear usuario nuevo
    // Generamos un username temporal para los usuarios de Google
    const baseUsername = `@${profile.nombre.toLowerCase().replace(/\s+/g, '')}`;
    const randomSuffix = Math.floor(Math.random() * 10000);
    const tempUsername = `${baseUsername}_${randomSuffix}`;

    return this.crear({
      username: tempUsername,
      googleId: profile.googleId,
      email: profile.email,
      nombre: profile.nombre,
      apellido: profile.apellido,
    });
  }

  /**
   * Valida credenciales locales (RUT o email + contraseña).
   * Retorna el usuario si son correctas, null si no.
   */
  async validarCredenciales(
    identificador: string,
    password: string,
  ): Promise<Usuario | null> {
    // Permite login con email o RUT
    const usuario =
      (await this.findByEmail(identificador)) ??
      (await this.findByRut(identificador));

    if (!usuario || !usuario.passwordHash) return null;

    const coincide = await bcrypt.compare(password, usuario.passwordHash);
    return coincide ? usuario : null;
  }

  /** Devuelve perfil público (sin passwordHash) */
  perfilPublico(usuario: Usuario) {
    const { passwordHash: _, ...perfil } = usuario;
    return perfil;
  }
}
