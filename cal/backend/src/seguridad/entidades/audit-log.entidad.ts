import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'usuario_id', nullable: true })
  usuarioId: number | null;

  @ManyToOne('Usuario', { nullable: true, onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: unknown;

  @Column({ type: 'varchar', length: 10 })
  accion: string;

  @Column({ type: 'varchar', length: 100 })
  entidad: string;

  @Column({ type: 'varchar', length: 255, name: 'entidad_id', nullable: true })
  entidadId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'jsonb', name: 'datos_previos', nullable: true })
  datosPrevios: Record<string, unknown> | null;

  @Column({ type: 'jsonb', name: 'datos_nuevos', nullable: true })
  datosNuevos: Record<string, unknown> | null;
}
