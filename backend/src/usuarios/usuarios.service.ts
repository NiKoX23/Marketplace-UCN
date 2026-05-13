import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Rol } from './usuario.entity';
import * as bcrypt from 'bcrypt';
import { ok } from 'assert';

const SALT_ROUNDS = 12;

export interface CreateUsuarioDto {
  username?: string;
  nombre: string;
  apellido: string;
  email: string;
  rut?: string;
  password?: string;
  googleId?: string;
  rol? : Rol;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { username } });
  }

  async findByRut(rut: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { rut } });
  }

  async findByGoogleId(googleId: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { googleId } });
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Usuario[]> {
    return this.repo.find({ order: { creadoEn: 'ASC' } });
  }

  async eliminarUsuario(id: string){
    const usuario = await this.repo.findOne({where:{id},});

    if(!usuario){ throw new NotFoundException("Usuario no encontrado");}
    if(usuario.rol === Rol.ADMIN){throw new ForbiddenException("No se puede eliminar un admin");}
    await this.repo.remove(usuario);

    return{
      ok: true,
      message: "Usuario eliminado",
    }
  }

  async crear(dto: CreateUsuarioDto): Promise<Usuario> {
    const existente = await this.findByEmail(dto.email);
    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }

    if (dto.username) {
      const existenteUsername = await this.findByUsername(dto.username);
      if (existenteUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

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
      rol: dto.rol ?? Rol.USER,
    });

    return this.repo.save(usuario);
  }

  async findOrCreateGoogle(profile: {
    googleId: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: Rol;
  }): Promise<Usuario> {
    let usuario = await this.findByGoogleId(profile.googleId);
    if (usuario) {
      if (usuario.rol !== profile.rol) {
        usuario.rol = profile.rol;
        return this.repo.save(usuario);
      }
      return usuario;
    }

    usuario = await this.findByEmail(profile.email);
    if (usuario) {
      usuario.googleId = profile.googleId;
      usuario.rol = profile.rol;
      return this.repo.save(usuario);
    }

    const baseUsername = `@${profile.nombre.toLowerCase().replace(/\s+/g, '')}`;
    const randomSuffix = Math.floor(Math.random() * 10000);
    const tempUsername = `${baseUsername}_${randomSuffix}`;

    return this.crear({
      username: tempUsername,
      googleId: profile.googleId,
      email: profile.email,
      nombre: profile.nombre,
      apellido: profile.apellido,
      rol: profile.rol,
    });
  }

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

  perfilPublico(usuario: Usuario) {
    const { passwordHash: _, ...perfil } = usuario;
    return perfil;
  }
}
