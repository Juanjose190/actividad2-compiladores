import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsuarioAutenticado } from './estrategias/jwt.estrategia';
import { AuthServicio } from './auth.servicio';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RespuestaAuthDto } from './dto/respuesta-auth.dto';
import { JwtGuardia } from './guardias/jwt.guardia';
import { UsuarioActual } from '../decoradores/usuario-actual.decorador';

@ApiTags('auth')
@Controller('auth')
export class AuthControlador {
  constructor(private readonly authServicio: AuthServicio) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens JWT' })
  @ApiResponse({ status: 200, type: RespuestaAuthDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<RespuestaAuthDto> {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '';
    return this.authServicio.login(dto, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({ status: 200, schema: { properties: { access_token: { type: 'string' } } } })
  refrescar(@Body() dto: RefreshTokenDto): Promise<Pick<RespuestaAuthDto, 'access_token'>> {
    return this.authServicio.refrescar(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtGuardia)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión e invalidar tokens' })
  @ApiResponse({ status: 204 })
  async logout(@UsuarioActual() usuario: UsuarioAutenticado): Promise<void> {
    await this.authServicio.logout(usuario.id);
  }
}
