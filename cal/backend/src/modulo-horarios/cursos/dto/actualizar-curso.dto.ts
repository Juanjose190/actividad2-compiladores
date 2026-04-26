import { PartialType } from '@nestjs/swagger';
import { CrearCursoDto } from './crear-curso.dto';

export class ActualizarCursoDto extends PartialType(CrearCursoDto) {}
