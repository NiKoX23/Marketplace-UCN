import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  providers: [ChatGateway],
})
export class ChatModule {}
