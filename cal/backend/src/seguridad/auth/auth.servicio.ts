import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Sesion } from '../entidades/sesion.entidad';
import { Usuario } from '../entidades/usuario.entidad';
import { LoginDto } from './dto/login.dto';
import { RespuestaAuthDto } from './dto/respuesta-auth.dto';

@Injectable()
export class AuthServicio {
  private readonly logger = new Logger(AuthServicio.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ipOrigen: string): Promise<RespuestaAuthDto> {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email, activo: true },
      select: ['id', 'email', 'passwordHash', 'nombre', 'activo'],
      relations: ['rol'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.passwordHash);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.firmarAcceso(usuario.id, usuario.email, usuario.rol.nombre);
    const refreshToken = this.firmarRefresco(usuario.id);

    const expiracionAcceso = this.calcularExpiracion(
      this.configService.get<string>('JWT_EXPIRACION', '8h'),
    );

    await this.sesionRepo.save(
      this.sesionRepo.create({
        usuario,
        tokenJwt: accessToken,
        fechaEmision: new Date(),
        fechaExpiracion: expiracionAcceso,
        ipOrigen: ipOrigen || null,
      }),
    );

    return { access_token: accessToken, refresh_token: refreshToken, rol: usuario.rol.nombre };
  }

  async refrescar(refreshToken: string): Promise<Pick<RespuestaAuthDto, 'access_token'>> {
    let payload: { sub: number; tipo: string };
    try {
      payload = this.jwtService.verify<{ sub: number; tipo: string }>(refreshToken);
    } catch {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    if (payload.tipo !== 'refresco') {
      throw new UnauthorizedException('Token inválido para esta operación');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id: payload.sub, activo: true },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const accessToken = this.firmarAcceso(usuario.id, usuario.email, usuario.rol.nombre);
    return { access_token: accessToken };
  }

  async logout(usuarioId: number): Promise<void> {
    await this.sesionRepo.update(
      { usuario: { id: usuarioId } },
      { fechaExpiracion: new Date() },
    );
  }

  async hashContrasena(contrasena: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    return bcrypt.hash(contrasena, saltRounds);
  }

  private firmarAcceso(sub: number, email: string, rol: string): string {
    return this.jwtService.sign(
      { sub, email, rol, tipo: 'acceso' },
      { expiresIn: this.configService.get<string>('JWT_EXPIRACION', '8h') },
    );
  }

  private firmarRefresco(sub: number): string {
    return this.jwtService.sign(
      { sub, tipo: 'refresco' },
      { expiresIn: this.configService.get<string>('JWT_EXPIRACION_REFRESH', '7d') },
    );
  }

  private calcularExpiracion(duracion: string): Date {
    const ahora = Date.now();
    const unidades: Record<string, number> = { h: 3600_000, d: 86_400_000, m: 60_000 };
    const match = duracion.match(/^(\d+)([hmd])$/);
    if (!match) return new Date(ahora + 8 * 3600_000);
    return new Date(ahora + parseInt(match[1]) * (unidades[match[2]] ?? 3600_000));
  }
}
