import { ApiProperty } from '@nestjs/swagger';
import { TipoAula } from '../../entidades/aula.entidad';

export class RespuestaAulaDto {
  @ApiProperty() id: number;
  @ApiProperty() codigo: string;
  @ApiProperty() capacidad: number;
  @ApiProperty({ enum: TipoAula }) tipo: TipoAula;
  @ApiProperty() activa: boolean;
}

export class RespuestaPaginadaAulaDto {
  @ApiProperty({ type: [RespuestaAulaDto] }) items: RespuestaAulaDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
