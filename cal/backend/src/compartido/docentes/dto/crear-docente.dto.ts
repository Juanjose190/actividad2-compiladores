import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CrearDocenteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  usuarioId: number;

  @ApiProperty({ example: 'Inglés Avanzado', required: false, nullable: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  especialidad?: string;

  @ApiProperty({ example: 40, default: 40, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  cargaMaximaHoras?: number;
}
