import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPeriodoDto {
  @ApiProperty({ example: '2024-I' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2024-06-30' })
  @IsDateString()
  fechaFin: string;
}
