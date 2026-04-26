import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('periodo_academico')
export class PeriodoAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: string;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin: string;
}
