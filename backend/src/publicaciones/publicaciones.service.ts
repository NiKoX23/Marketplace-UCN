import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Publicacion } from "./publicacion.entity";
import { supabase } from "../Supabase/supabase.client";

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectRepository(Publicacion)
        private repo: Repository<Publicacion>,
    ) {}

    findAll() { return this.repo.find({ order: { creadoEn: "DESC" }}); }

    async crearPublicacion(
        file: any,
        titulo: string,
        comentario: string,
        usuarioId: string,
    ){
        const fileName = `${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET!)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            })

        if (error) { throw new Error("Error al subir el archivo"); }

        const { data: publicUrl } = supabase.storage
            .from(process.env.SUPABASE_BUCKET!)
            .getPublicUrl(fileName);

        const nuevaPublicacion = this.repo.create({
            titulo,
            comentario,
            fileUrl: publicUrl.publicUrl,
            fileName,
            usuarioId,
        });

        return this.repo.save(nuevaPublicacion);
    }
}
