import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CrearEstudianteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  usuarioId: number;

  @ApiProperty({ example: 2, required: false, nullable: true })
  @IsInt()
  @IsOptional()
  grupoId?: number | null;
}
