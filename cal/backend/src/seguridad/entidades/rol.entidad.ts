import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum RolNombre {
  Admin = 'Admin',
  Docente = 'Docente',
  Estudiante = 'Estudiante',
}

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @OneToMany('Usuario', 'rol')
  usuarios: unknown[];

  @ManyToMany('Permiso', 'roles')
  permisos: unknown[];
}
