import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aula } from '../entidades/aula.entidad';
import { ActualizarAulaDto } from './dto/actualizar-aula.dto';
import { CrearAulaDto } from './dto/crear-aula.dto';
import { RespuestaAulaDto, RespuestaPaginadaAulaDto } from './dto/respuesta-aula.dto';

@Injectable()
export class AulasServicio {
  constructor(
    @InjectRepository(Aula)
    private readonly aulaRepo: Repository<Aula>,
  ) {}

  async crear(dto: CrearAulaDto): Promise<RespuestaAulaDto> {
    const existe = await this.aulaRepo.findOne({ where: { codigo: dto.codigo } });
    if (existe) throw new ConflictException(`Ya existe un aula con el código ${dto.codigo}`);

    const aula = this.aulaRepo.create({ ...dto, activa: dto.activa ?? true });
    return this.mapear(await this.aulaRepo.save(aula));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaAulaDto> {
    const [items, total] = await this.aulaRepo.findAndCount({
      order: { codigo: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((a) => this.mapear(a)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaAulaDto> {
    const a = await this.aulaRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Aula ${id} no encontrada`);
    return this.mapear(a);
  }

  async actualizar(id: number, dto: ActualizarAulaDto): Promise<RespuestaAulaDto> {
    const a = await this.aulaRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Aula ${id} no encontrada`);

    if (dto.codigo && dto.codigo !== a.codigo) {
      const duplicado = await this.aulaRepo.findOne({ where: { codigo: dto.codigo } });
      if (duplicado) throw new ConflictException(`El código ${dto.codigo} ya está en uso`);
    }

    Object.assign(a, dto);
    return this.mapear(await this.aulaRepo.save(a));
  }

  async eliminar(id: number): Promise<void> {
    const a = await this.aulaRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Aula ${id} no encontrada`);
    await this.aulaRepo.remove(a);
  }

  private mapear(a: Aula): RespuestaAulaDto {
    return { id: a.id, codigo: a.codigo, capacidad: a.capacidad, tipo: a.tipo, activa: a.activa };
  }
}
