import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req, UnauthorizedException, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { BadRequestException } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private readonly service: PublicacionesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get('/canal/:id')
    findByCanal(
        @Param('id') id: string,
    ){
        return this.service.findByCanal(Number(id));
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    crear(
        @UploadedFile() file: any,
        @Body('titulo') titulo: string,
        @Body('comentario') comentario: string,
        @Body('canalId') canalId: string,
        @Req() req: any,
    ) {
        const usuarioId = req.user.id;
        
        if (!req.user?.id) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        
        console.log(file.mimetype);
        if(!file) {throw new BadRequestException("No se selecciono ningun archivo")}
        
        const allowedExtensions = process.env.ALLOWED_EXTENSIONS?.split(',') || [];
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const maxSizeFile = Number(process.env.MAX_SIZE_FILE);
        const canalIdNumber = Number(canalId);

        if(!extension || !allowedExtensions.includes(extension)){ throw new BadRequestException("Archivo no aceptado"); }
        if(!maxSizeFile || isNaN(maxSizeFile)){ throw new BadRequestException("Error peso archivo"); }
        if(file.size > maxSizeFile) { throw new BadRequestException("Peso del archivo no permitido"); }
        if(isNaN(canalIdNumber)){ throw new BadRequestException("Canal incorrecto"); }


    return this.service.crearPublicacion(
        file,
        titulo,
        comentario,
        usuarioId,
        canalIdNumber,
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("admin")
  async eliminarPublicacion(
    @Param("id") id: string,
  ){
    return this.service.eliminarPublicacion(id);
  }
}