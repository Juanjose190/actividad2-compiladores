import { PartialType } from '@nestjs/swagger';
import { CrearAulaDto } from './crear-aula.dto';

export class ActualizarAulaDto extends PartialType(CrearAulaDto) {}
