import { PartialType } from '@nestjs/swagger';
import { CrearDisponibilidadDto } from './crear-disponibilidad.dto';

export class ActualizarDisponibilidadDto extends PartialType(CrearDisponibilidadDto) {}
