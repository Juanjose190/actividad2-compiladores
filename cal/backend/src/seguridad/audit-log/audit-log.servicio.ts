import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { AuditLog } from '../entidades/audit-log.entidad';
import { RespuestaPaginadaAuditLogDto } from './dto/respuesta-audit-log.dto';

export interface RegistrarAuditDto {
  usuarioId?: number | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  datosPrevios?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogServicio {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async registrar(dto: RegistrarAuditDto): Promise<void> {
    const entrada = this.auditLogRepo.create({
      usuarioId: dto.usuarioId ?? null,
      accion: dto.accion,
      entidad: dto.entidad,
      entidadId: dto.entidadId ?? null,
      datosPrevios: dto.datosPrevios ?? null,
      datosNuevos: dto.datosNuevos ?? null,
    });
    await this.auditLogRepo.save(entrada);
  }

  async listar(
    page: number,
    size: number,
    filtros: { entidad?: string; fechaDesde?: string; fechaHasta?: string },
  ): Promise<RespuestaPaginadaAuditLogDto> {
    const where: FindOptionsWhere<AuditLog> = {};

    if (filtros.entidad) where.entidad = filtros.entidad;

    if (filtros.fechaDesde && filtros.fechaHasta) {
      where.timestamp = Between(new Date(filtros.fechaDesde), new Date(filtros.fechaHasta));
    }

    const [items, total] = await this.auditLogRepo.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return { items, total, page, size };
  }
}
