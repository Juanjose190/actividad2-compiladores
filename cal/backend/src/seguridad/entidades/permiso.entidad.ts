import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permiso')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @ManyToMany('Rol', 'permisos')
  roles: unknown[];
}
