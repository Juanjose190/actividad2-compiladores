import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { FranjaHoraria } from './franja-horaria.entidad';

@Entity('disponibilidad')
@Unique(['docente', 'franjaHoraria'])
export class Disponibilidad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Docente, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'docente_id' })
  docente: Docente;

  @ManyToOne(() => FranjaHoraria, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'franja_horaria_id' })
  franjaHoraria: FranjaHoraria;

  @Column({ type: 'boolean', default: true })
  disponible: boolean;
}
