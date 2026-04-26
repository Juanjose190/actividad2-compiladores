import { ApiProperty } from '@nestjs/swagger';

export class RespuestaCursoDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() nivelId: number;
  @ApiProperty() nivelCodigo: string;
  @ApiProperty() intensidadHoraria: number;
}

export class RespuestaPaginadaCursoDto {
  @ApiProperty({ type: [RespuestaCursoDto] }) items: RespuestaCursoDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
