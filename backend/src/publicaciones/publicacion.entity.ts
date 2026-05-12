import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Canal } from '../canales/canales.entity';

@Entity('publicaciones')
export class Publicacion {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column() titulo!: string;
    @Column({ type: 'text' }) comentario!: string;

    @Column() fileUrl!: string;
    @Column() fileName!: string;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'usuarioId' }) usuario!: Usuario;

    @ManyToOne(() => Canal, {eager: true})
    @JoinColumn({name: 'canalId'})
    canal!: Canal;
    @Column()
    canalId!: number;

    @Column() usuarioId!: string;
    @CreateDateColumn() creadoEn!: Date;
}