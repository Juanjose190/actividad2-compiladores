import { ApiProperty } from '@nestjs/swagger';

export class RespuestaDisponibilidadDto {
  @ApiProperty() id: number;
  @ApiProperty() docenteId: number;
  @ApiProperty() docenteNombre: string;
  @ApiProperty() franjaHorariaId: number;
  @ApiProperty() diaSemana: string;
  @ApiProperty() horaInicio: string;
  @ApiProperty() horaFin: string;
  @ApiProperty() disponible: boolean;
}

export class RespuestaPaginadaDisponibilidadDto {
  @ApiProperty({ type: [RespuestaDisponibilidadDto] }) items: RespuestaDisponibilidadDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
