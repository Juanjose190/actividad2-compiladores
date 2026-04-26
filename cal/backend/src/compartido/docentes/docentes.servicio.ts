import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../seguridad/entidades/usuario.entidad';
import { Docente } from '../entidades/docente.entidad';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { RespuestaDocenteDto, RespuestaPaginadaDocenteDto } from './dto/respuesta-docente.dto';

@Injectable()
export class DocentesServicio {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CrearDocenteDto): Promise<RespuestaDocenteDto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);

    const docente = this.docenteRepo.create({
      usuario,
      especialidad: dto.especialidad ?? null,
      cargaMaximaHoras: dto.cargaMaximaHoras ?? 40,
    });
    return this.mapear(await this.docenteRepo.save(docente));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaDocenteDto> {
    const [items, total] = await this.docenteRepo.findAndCount({
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((d) => this.mapear(d)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaDocenteDto> {
    const d = await this.docenteRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Docente ${id} no encontrado`);
    return this.mapear(d);
  }

  async actualizar(id: number, dto: ActualizarDocenteDto): Promise<RespuestaDocenteDto> {
    const d = await this.docenteRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Docente ${id} no encontrado`);

    if (dto.usuarioId !== undefined) {
      const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuarioId } });
      if (!usuario) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);
      d.usuario = usuario;
    }
    if (dto.especialidad !== undefined) d.especialidad = dto.especialidad ?? null;
    if (dto.cargaMaximaHoras !== undefined) d.cargaMaximaHoras = dto.cargaMaximaHoras;

    return this.mapear(await this.docenteRepo.save(d));
  }

  async eliminar(id: number): Promise<void> {
    const d = await this.docenteRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Docente ${id} no encontrado`);
    await this.docenteRepo.remove(d);
  }

  private mapear(d: Docente): RespuestaDocenteDto {
    return {
      id: d.id,
      usuarioId: d.usuario.id,
      usuarioNombre: d.usuario.nombre,
      usuarioEmail: d.usuario.email,
      especialidad: d.especialidad,
      cargaMaximaHoras: d.cargaMaximaHoras,
    };
  }
}
