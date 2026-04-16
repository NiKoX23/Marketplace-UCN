import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum Rol {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true, where: '"rut" IS NOT NULL' })
  @Column({ nullable: true, type: 'varchar', length: 12 })
  rut!: string | null;

  @Index({ unique: true, where: '"username" IS NOT NULL' })
  @Column({ nullable: true, type: 'varchar', length: 50 })
  username!: string | null;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 150 })
  email!: string;

  /**
   * Hash bcrypt de la contraseña.
   * NULL cuando el usuario se autentica exclusivamente con Google OAuth.
   */
  @Column({ nullable: true, type: 'varchar' })
  passwordHash!: string | null;

  /**
   * ID de Google cuando el usuario inicia sesión con OAuth.
   */
  @Index({ unique: true, where: '"googleId" IS NOT NULL' })
  @Column({ nullable: true, type: 'varchar' })
  googleId!: string | null;

  @Column({ type: 'enum', enum: Rol, default: Rol.USER })
  rol!: Rol;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;
}
