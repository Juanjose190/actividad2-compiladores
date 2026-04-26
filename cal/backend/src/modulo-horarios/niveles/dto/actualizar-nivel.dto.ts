import { PartialType } from '@nestjs/swagger';
import { CrearNivelDto } from './crear-nivel.dto';

export class ActualizarNivelDto extends PartialType(CrearNivelDto) {}
