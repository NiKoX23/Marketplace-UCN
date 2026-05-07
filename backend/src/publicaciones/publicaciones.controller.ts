import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req, UnauthorizedException } 
        from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private readonly service: PublicacionesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    crear(
        @UploadedFile() file: any,
        @Body('titulo') titulo: string,
        @Body('comentario') comentario: string,
        @Req() req: any,
    ) {
    const usuarioId = req.user.id;
    
    if (!req.user?.id) {
        throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.service.crearPublicacion(
        file,
        titulo,
        comentario,
        usuarioId,
    );
  }
}