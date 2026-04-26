import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';
import { DiaSemana } from '../../entidades/franja-horaria.entidad';

export class CrearFranjaDto {
  @ApiProperty({ enum: DiaSemana, example: DiaSemana.Lunes })
  @IsIn(Object.values(DiaSemana))
  diaSemana: DiaSemana;

  @ApiProperty({ example: '08:00:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'horaInicio debe tener formato HH:MM o HH:MM:SS' })
  horaInicio: string;

  @ApiProperty({ example: '10:00:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'horaFin debe tener formato HH:MM o HH:MM:SS' })
  horaFin: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  bloqueIdx: number;
}
