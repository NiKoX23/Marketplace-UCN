import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('usuarios')
  async listarUsuarios() {
    const usuarios = await this.usuariosService.findAll();
    // Omitir datos sensibles
    return usuarios.map(({ passwordHash, googleId, ...pub }) => pub);
  }
}
