import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity('canales')
export class Canal{
    @PrimaryGeneratedColumn()
        id!: number;
    
    @Column({unique: true,})
        nombre!: string;
    
    @Column({nullable: true,})
        descripcion!: string;
        
    @CreateDateColumn()
        creadoEn!: Date;
}