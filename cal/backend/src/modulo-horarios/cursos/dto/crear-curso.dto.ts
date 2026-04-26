import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CrearCursoDto {
  @ApiProperty({ example: 'Inglés A1 - Básico' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  nivelId: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  intensidadHoraria: number;
}
