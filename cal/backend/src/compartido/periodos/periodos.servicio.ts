import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../entidades/periodo-academico.entidad';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { RespuestaPaginadaPeriodoDto, RespuestaPeriodoDto } from './dto/respuesta-periodo.dto';

@Injectable()
export class PeriodosServicio {
  constructor(
    @InjectRepository(PeriodoAcademico)
    private readonly periodoRepo: Repository<PeriodoAcademico>,
  ) {}

  async crear(dto: CrearPeriodoDto): Promise<RespuestaPeriodoDto> {
    const periodo = this.periodoRepo.create(dto);
    return this.mapear(await this.periodoRepo.save(periodo));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaPeriodoDto> {
    const [items, total] = await this.periodoRepo.findAndCount({
      order: { fechaInicio: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((p) => this.mapear(p)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaPeriodoDto> {
    const p = await this.periodoRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Periodo ${id} no encontrado`);
    return this.mapear(p);
  }

  async actualizar(id: number, dto: ActualizarPeriodoDto): Promise<RespuestaPeriodoDto> {
    const p = await this.periodoRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Periodo ${id} no encontrado`);
    Object.assign(p, dto);
    return this.mapear(await this.periodoRepo.save(p));
  }

  async eliminar(id: number): Promise<void> {
    const p = await this.periodoRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Periodo ${id} no encontrado`);
    await this.periodoRepo.remove(p);
  }

  private mapear(p: PeriodoAcademico): RespuestaPeriodoDto {
    return { id: p.id, nombre: p.nombre, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin };
  }
}
