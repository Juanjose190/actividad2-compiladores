import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Disponibilidad } from '../entidades/disponibilidad.entidad';
import { FranjaHoraria } from '../entidades/franja-horaria.entidad';
import { ActualizarDisponibilidadDto } from './dto/actualizar-disponibilidad.dto';
import { CrearDisponibilidadDto } from './dto/crear-disponibilidad.dto';
import { RespuestaDisponibilidadDto, RespuestaPaginadaDisponibilidadDto } from './dto/respuesta-disponibilidad.dto';

@Injectable()
export class DisponibilidadesServicio {
  constructor(
    @InjectRepository(Disponibilidad)
    private readonly dispRepo: Repository<Disponibilidad>,
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(FranjaHoraria)
    private readonly franjaRepo: Repository<FranjaHoraria>,
  ) {}

  async crear(dto: CrearDisponibilidadDto): Promise<RespuestaDisponibilidadDto> {
    const docente = await this.docenteRepo.findOne({ where: { id: dto.docenteId } });
    if (!docente) throw new NotFoundException(`Docente ${dto.docenteId} no encontrado`);

    const franja = await this.franjaRepo.findOne({ where: { id: dto.franjaHorariaId } });
    if (!franja) throw new NotFoundException(`Franja horaria ${dto.franjaHorariaId} no encontrada`);

    const existe = await this.dispRepo.findOne({ where: { docente: { id: dto.docenteId }, franjaHoraria: { id: dto.franjaHorariaId } } });
    if (existe) throw new ConflictException('Ya existe disponibilidad para este docente en esta franja');

    const disp = this.dispRepo.create({ docente, franjaHoraria: franja, disponible: dto.disponible ?? true });
    return this.mapear(await this.dispRepo.save(disp));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaDisponibilidadDto> {
    const [items, total] = await this.dispRepo.findAndCount({
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((d) => this.mapear(d)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaDisponibilidadDto> {
    const d = await this.dispRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Disponibilidad ${id} no encontrada`);
    return this.mapear(d);
  }

  async actualizar(id: number, dto: ActualizarDisponibilidadDto): Promise<RespuestaDisponibilidadDto> {
    const d = await this.dispRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Disponibilidad ${id} no encontrada`);

    if (dto.disponible !== undefined) d.disponible = dto.disponible;

    return this.mapear(await this.dispRepo.save(d));
  }

  async eliminar(id: number): Promise<void> {
    const d = await this.dispRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Disponibilidad ${id} no encontrada`);
    await this.dispRepo.remove(d);
  }

  private mapear(d: Disponibilidad): RespuestaDisponibilidadDto {
    return {
      id: d.id,
      docenteId: d.docente.id,
      docenteNombre: d.docente.usuario.nombre,
      franjaHorariaId: d.franjaHoraria.id,
      diaSemana: d.franjaHoraria.diaSemana,
      horaInicio: d.franjaHoraria.horaInicio,
      horaFin: d.franjaHoraria.horaFin,
      disponible: d.disponible,
    };
  }
}
