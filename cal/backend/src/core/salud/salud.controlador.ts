import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('salud')
@Controller('health')
export class SaludControlador {
  @Get()
  @ApiOperation({ summary: 'Verificar estado de la API' })
  @ApiResponse({ status: 200, description: 'API funcionando correctamente' })
  verificar() {
    return {
      estado: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }
}
