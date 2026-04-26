import { ApiProperty } from '@nestjs/swagger';
import { DiaSemana } from '../../entidades/franja-horaria.entidad';

export class RespuestaFranjaDto {
  @ApiProperty() id: number;
  @ApiProperty({ enum: DiaSemana }) diaSemana: DiaSemana;
  @ApiProperty() horaInicio: string;
  @ApiProperty() horaFin: string;
  @ApiProperty() bloqueIdx: number;
}

export class RespuestaPaginadaFranjaDto {
  @ApiProperty({ type: [RespuestaFranjaDto] }) items: RespuestaFranjaDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
