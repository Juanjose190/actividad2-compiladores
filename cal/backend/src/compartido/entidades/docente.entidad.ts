import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../seguridad/entidades/usuario.entidad';

@Entity('docente')
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 200, nullable: true })
  especialidad: string | null;

  @Column({ type: 'int', name: 'carga_maxima_horas', default: 40 })
  cargaMaximaHoras: number;

  @OneToMany('Disponibilidad', 'docente')
  disponibilidades: unknown[];
}
