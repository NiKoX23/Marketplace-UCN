import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UsuariosModule, AuthModule, PassportModule],
  controllers: [AdminController],
})
export class AdminModule {}
