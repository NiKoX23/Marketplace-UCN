import {Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private readonly service: PublicacionesService) {}

    @Get()
    findAll() { return this.service.findAll(); }

    @Post()
    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('file'))
    crear(
        @UploadedFile() file: any,
        @Body('titulo') titulo: string,
        @Body('comentario') comentario: string,
        @Req() req: any,
    ) {
        const usuarioId = req.user.sub;
        return this.service.crearPublicacion(file, titulo, comentario, usuarioId);
      }
}