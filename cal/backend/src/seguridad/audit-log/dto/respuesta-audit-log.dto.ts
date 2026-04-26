import { ApiProperty } from '@nestjs/swagger';

export class RespuestaAuditLogDto {
  @ApiProperty() id: number;
  @ApiProperty() usuarioId: number | null;
  @ApiProperty() accion: string;
  @ApiProperty() entidad: string;
  @ApiProperty() entidadId: string | null;
  @ApiProperty() timestamp: Date;
  @ApiProperty() datosPrevios: Record<string, unknown> | null;
  @ApiProperty() datosNuevos: Record<string, unknown> | null;
}

export class RespuestaPaginadaAuditLogDto {
  @ApiProperty({ type: [RespuestaAuditLogDto] }) items: RespuestaAuditLogDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
