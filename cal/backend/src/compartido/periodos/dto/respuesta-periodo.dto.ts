import { ApiProperty } from '@nestjs/swagger';

export class RespuestaPeriodoDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() fechaInicio: string;
  @ApiProperty() fechaFin: string;
}

export class RespuestaPaginadaPeriodoDto {
  @ApiProperty({ type: [RespuestaPeriodoDto] }) items: RespuestaPeriodoDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
