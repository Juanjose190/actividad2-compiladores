import { ApiProperty } from '@nestjs/swagger';
import { CodigoNivel } from '../../entidades/nivel-idioma.entidad';

export class RespuestaNivelDto {
  @ApiProperty() id: number;
  @ApiProperty({ enum: CodigoNivel }) codigo: CodigoNivel;
  @ApiProperty() nombre: string;
}

export class RespuestaPaginadaNivelDto {
  @ApiProperty({ type: [RespuestaNivelDto] }) items: RespuestaNivelDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
