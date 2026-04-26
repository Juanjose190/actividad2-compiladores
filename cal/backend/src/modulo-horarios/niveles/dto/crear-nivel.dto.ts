import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CodigoNivel } from '../../entidades/nivel-idioma.entidad';

export class CrearNivelDto {
  @ApiProperty({ enum: CodigoNivel, example: CodigoNivel.A1 })
  @IsIn(Object.values(CodigoNivel))
  codigo: CodigoNivel;

  @ApiProperty({ example: 'Principiante' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}
