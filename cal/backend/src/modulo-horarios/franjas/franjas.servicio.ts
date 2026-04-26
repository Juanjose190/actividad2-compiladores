import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FranjaHoraria } from '../entidades/franja-horaria.entidad';
import { ActualizarFranjaDto } from './dto/actualizar-franja.dto';
import { CrearFranjaDto } from './dto/crear-franja.dto';
import { RespuestaFranjaDto, RespuestaPaginadaFranjaDto } from './dto/respuesta-franja.dto';

@Injectable()
export class FranjasServicio {
  constructor(
    @InjectRepository(FranjaHoraria)
    private readonly franjaRepo: Repository<FranjaHoraria>,
  ) {}

  async crear(dto: CrearFranjaDto): Promise<RespuestaFranjaDto> {
    const franja = this.franjaRepo.create(dto);
    return this.mapear(await this.franjaRepo.save(franja));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaFranjaDto> {
    const [items, total] = await this.franjaRepo.findAndCount({
      order: { diaSemana: 'ASC', bloqueIdx: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((f) => this.mapear(f)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaFranjaDto> {
    const f = await this.franjaRepo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Franja horaria ${id} no encontrada`);
    return this.mapear(f);
  }

  async actualizar(id: number, dto: ActualizarFranjaDto): Promise<RespuestaFranjaDto> {
    const f = await this.franjaRepo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Franja horaria ${id} no encontrada`);
    Object.assign(f, dto);
    return this.mapear(await this.franjaRepo.save(f));
  }

  async eliminar(id: number): Promise<void> {
    const f = await this.franjaRepo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Franja horaria ${id} no encontrada`);
    await this.franjaRepo.remove(f);
  }

  private mapear(f: FranjaHoraria): RespuestaFranjaDto {
    return {
      id: f.id,
      diaSemana: f.diaSemana,
      horaInicio: f.horaInicio,
      horaFin: f.horaFin,
      bloqueIdx: f.bloqueIdx,
    };
  }
}
