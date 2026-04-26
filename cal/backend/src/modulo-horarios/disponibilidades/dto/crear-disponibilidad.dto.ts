import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CrearDisponibilidadDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  docenteId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  franjaHorariaId: number;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}
