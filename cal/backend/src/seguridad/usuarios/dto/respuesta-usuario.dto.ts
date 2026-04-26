import { ApiProperty } from '@nestjs/swagger';

export class RespuestaUsuarioDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() email: string;
  @ApiProperty() rol: string;
  @ApiProperty() activo: boolean;
  @ApiProperty() fechaCreacion: Date;
}

export class RespuestaPaginadaUsuarioDto {
  @ApiProperty({ type: [RespuestaUsuarioDto] }) items: RespuestaUsuarioDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
