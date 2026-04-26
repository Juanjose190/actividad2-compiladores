import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum DiaSemana {
  Lunes = 'LUN',
  Martes = 'MAR',
  Miercoles = 'MIE',
  Jueves = 'JUE',
  Viernes = 'VIE',
  Sabado = 'SAB',
}

@Entity('franja_horaria')
export class FranjaHoraria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DiaSemana, name: 'dia_semana' })
  diaSemana: DiaSemana;

  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;

  @Column({ type: 'int', name: 'bloque_idx' })
  bloqueIdx: number;
}
