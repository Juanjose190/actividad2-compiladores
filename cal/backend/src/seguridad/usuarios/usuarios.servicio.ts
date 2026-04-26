import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol, RolNombre } from '../entidades/rol.entidad';
import { Usuario } from '../entidades/usuario.entidad';
import { AuthServicio } from '../auth/auth.servicio';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { RespuestaPaginadaUsuarioDto, RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';

@Injectable()
export class UsuariosServicio {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    private readonly authServicio: AuthServicio,
  ) {}

  async crear(dto: CrearUsuarioDto): Promise<RespuestaUsuarioDto> {
    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new ConflictException(`Ya existe un usuario con el email ${dto.email}`);
    }

    const rol = await this.rolRepo.findOne({ where: { nombre: dto.rol } });
    if (!rol) {
      throw new NotFoundException(`Rol '${dto.rol}' no encontrado`);
    }

    const passwordHash = await this.authServicio.hashContrasena(dto.contrasena);
    const usuario = this.usuarioRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      rol,
      activo: dto.activo ?? true,
    });

    const guardado = await this.usuarioRepo.save(usuario);
    return this.mapearRespuesta(guardado);
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaUsuarioDto> {
    const [items, total] = await this.usuarioRepo.findAndCount({
      order: { fechaCreacion: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map(this.mapearRespuesta), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaUsuarioDto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return this.mapearRespuesta(usuario);
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto): Promise<RespuestaUsuarioDto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    if (dto.email && dto.email !== usuario.email) {
      const duplicado = await this.usuarioRepo.findOne({ where: { email: dto.email } });
      if (duplicado) throw new ConflictException(`El email ${dto.email} ya está en uso`);
      usuario.email = dto.email;
    }

    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.activo !== undefined) usuario.activo = dto.activo;

    if (dto.rol) {
      const rol = await this.rolRepo.findOne({ where: { nombre: dto.rol as RolNombre } });
      if (!rol) throw new NotFoundException(`Rol '${dto.rol}' no encontrado`);
      usuario.rol = rol;
    }

    if (dto.contrasena) {
      usuario.passwordHash = await this.authServicio.hashContrasena(dto.contrasena);
    }

    const actualizado = await this.usuarioRepo.save(usuario);
    return this.mapearRespuesta(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    await this.usuarioRepo.remove(usuario);
  }

  private mapearRespuesta(usuario: Usuario): RespuestaUsuarioDto {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol?.nombre ?? '',
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
    };
  }
}
