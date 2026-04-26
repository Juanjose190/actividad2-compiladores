import { ApiProperty } from '@nestjs/swagger';

export class RespuestaEstudianteDto {
  @ApiProperty() id: number;
  @ApiProperty() usuarioId: number;
  @ApiProperty() usuarioNombre: string;
  @ApiProperty() usuarioEmail: string;
  @ApiProperty({ nullable: true }) grupoId: number | null;
}

export class RespuestaPaginadaEstudianteDto {
  @ApiProperty({ type: [RespuestaEstudianteDto] }) items: RespuestaEstudianteDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
