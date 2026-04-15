import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Publicacion } from "./publicacion.entity";
import { PublicacionesController } from "./publicaciones.controller";
import { PublicacionesService } from "./publicaciones.service";

@Module({
    imports: [TypeOrmModule.forFeature([Publicacion])],
    providers: [PublicacionesService],
    controllers: [PublicacionesController],
    exports: [PublicacionesService],
})

export class PublicacionesModule {}