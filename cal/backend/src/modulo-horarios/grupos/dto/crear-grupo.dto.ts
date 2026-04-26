import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { Jornada } from '../../entidades/grupo.entidad';

export class CrearGrupoDto {
  @ApiProperty({ example: 'G-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  cursoId: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  cupoMax: number;

  @ApiProperty({ enum: Jornada, example: Jornada.Manana })
  @IsIn(Object.values(Jornada))
  jornada: Jornada;
}
