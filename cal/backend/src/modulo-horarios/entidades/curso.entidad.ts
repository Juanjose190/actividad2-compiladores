import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NivelIdioma } from './nivel-idioma.entidad';

@Entity('curso')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @ManyToOne(() => NivelIdioma, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nivel_id' })
  nivel: NivelIdioma;

  @Column({ type: 'int', name: 'intensidad_horaria' })
  intensidadHoraria: number;

  @OneToMany('Grupo', 'curso')
  grupos: unknown[];
}
