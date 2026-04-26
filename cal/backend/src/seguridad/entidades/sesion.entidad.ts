import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entidad';

@Entity('sesion')
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'text', name: 'token_jwt' })
  tokenJwt: string;

  @Column({ type: 'timestamptz', name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ type: 'timestamptz', name: 'fecha_expiracion' })
  fechaExpiracion: Date;

  @Column({ type: 'varchar', length: 45, name: 'ip_origen', nullable: true })
  ipOrigen: string | null;
}
