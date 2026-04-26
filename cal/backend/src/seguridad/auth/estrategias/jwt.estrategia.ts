import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  tipo: string;
}

export interface UsuarioAutenticado {
  id: number;
  email: string;
  rol: string;
}

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRETO', 'secreto_por_defecto'),
    });
  }

  validate(payload: JwtPayload): UsuarioAutenticado {
    if (payload.tipo !== 'acceso') {
      throw new UnauthorizedException('Token inválido para este recurso');
    }
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  }
}
