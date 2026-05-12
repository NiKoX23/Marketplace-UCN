import { Controller, Get,Post, Body } from '@nestjs/common';
import { CanalesService } from './canales.service';

@Controller('canales')
export class CanalesController {
    constructor(
        private readonly canalesService: CanalesService,
    ){}

    @Get()
    findAll() {
        return this.canalesService.findAll();
    }

    @Post()
    crear(
        @Body('nombre') nombre: string,
        @Body('descripcion') descripcion?: string,
    ) {
        return this.canalesService.crear(
        nombre,
        descripcion,
        );
    }
}