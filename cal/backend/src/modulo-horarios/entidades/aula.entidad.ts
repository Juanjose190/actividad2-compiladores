import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoAula {
  Salon = 'SALON',
  Lab = 'LAB',
  Virtual = 'VIRTUAL',
}

@Entity('aula')
export class Aula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo: string;

  @Column({ type: 'int' })
  capacidad: number;

  @Column({ type: 'enum', enum: TipoAula, default: TipoAula.Salon })
  tipo: TipoAula;

  @Column({ type: 'boolean', default: true })
  activa: boolean;
}
