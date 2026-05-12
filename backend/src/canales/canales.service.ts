import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Canal } from "./canales.entity";

@Injectable()
export class CanalesService{
    
    constructor(
        @InjectRepository(Canal)
        private canalesRepository: Repository<Canal>,
    ){}

    async crear(
        nombre: string,
        descripcion?: string,
    ){
        const canal = this.canalesRepository.create({nombre, descripcion});
        return this.canalesRepository.save(canal);
    }

    async findAll(){
        return this.canalesRepository.find({
            order:{
                nombre: 'ASC',
            },
        });
    }

    async findById(id: number){
        return this.canalesRepository.findOne({
            where: {id},
        });
    }
}