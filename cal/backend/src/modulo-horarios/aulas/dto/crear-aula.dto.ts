import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TipoAula } from '../../entidades/aula.entidad';

export class CrearAulaDto {
  @ApiProperty({ example: 'A-101' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  capacidad: number;

  @ApiProperty({ enum: TipoAula, default: TipoAula.Salon })
  @IsIn(Object.values(TipoAula))
  tipo: TipoAula;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
