import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('publicaciones')
export class Publicacion {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column() titulo!: string;
    @Column({ type: 'text' }) comentario!: string;

    // URL del archivo en Cloudflare
    @Column() fileUrl!: string;
    @Column() fileName!: string;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'usuarioId' }) usuario!: Usuario;

    @Column() usuarioId!: string;
    @CreateDateColumn() creadoEn!: Date;
}