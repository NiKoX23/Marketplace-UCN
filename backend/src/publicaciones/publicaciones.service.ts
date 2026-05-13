import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Publicacion } from "./publicacion.entity";
import { supabase } from "../Supabase/supabase.client";

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectRepository(Publicacion)
        private repo: Repository<Publicacion>,
    ) {}

    findAll() { return this.repo.find({ order: { creadoEn: "DESC" }, relations: ['usuario'] }); }

    async findByCanal(canalId: number){
        return this.repo.find({
            where:{
                canalId,
            },
            order:{
                creadoEn:"DESC",
            },
            relations: ['usuario'],
        })
    }

    async crearPublicacion(
        file: any,
        titulo: string,
        comentario: string,
        usuarioId: string,
        canalId: number,
    ){
        const sanitizedFileName = file.originalname
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_")

        const fileName = `${Date.now()}-${sanitizedFileName}`;
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET!)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            })

        if (error) { console.log(error); throw new Error(error.message) }

        const { data: publicUrl } = supabase.storage
            .from(process.env.SUPABASE_BUCKET!)
            .getPublicUrl(fileName);

        const nuevaPublicacion = this.repo.create({
            titulo,
            comentario,
            fileUrl: publicUrl.publicUrl,
            fileName,
            usuarioId,
            canalId,
        });

        return this.repo.save(nuevaPublicacion);
    }

    async eliminarPublicacion(id: string){
        const publicacion = await this.repo.findOne({where:{id}})

        if(!publicacion){
            throw new NotFoundException("Publicación no encontrada",);
        }

        const {error} = await supabase.storage.from(process.env.SUPABASE_BUCKET!).remove([publicacion.fileName]);
        if(error){console.error("Error al borrar publicacions",error);}
        await this.repo.remove(publicacion);

        return{
            ok: true,
            message: "Publicacion borrada",
        }
    }
}
