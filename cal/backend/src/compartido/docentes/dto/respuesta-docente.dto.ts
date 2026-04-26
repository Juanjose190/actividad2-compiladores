import { ApiProperty } from '@nestjs/swagger';

export class RespuestaDocenteDto {
  @ApiProperty() id: number;
  @ApiProperty() usuarioId: number;
  @ApiProperty() usuarioNombre: string;
  @ApiProperty() usuarioEmail: string;
  @ApiProperty({ nullable: true }) especialidad: string | null;
  @ApiProperty() cargaMaximaHoras: number;
}

export class RespuestaPaginadaDocenteDto {
  @ApiProperty({ type: [RespuestaDocenteDto] }) items: RespuestaDocenteDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
