import { PartialType } from '@nestjs/swagger';
import { CrearFranjaDto } from './crear-franja.dto';

export class ActualizarFranjaDto extends PartialType(CrearFranjaDto) {}
