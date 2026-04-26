import { PartialType } from '@nestjs/swagger';
import { CrearDocenteDto } from './crear-docente.dto';

export class ActualizarDocenteDto extends PartialType(CrearDocenteDto) {}
