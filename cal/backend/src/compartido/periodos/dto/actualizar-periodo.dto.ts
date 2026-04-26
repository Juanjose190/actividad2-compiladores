import { PartialType } from '@nestjs/swagger';
import { CrearPeriodoDto } from './crear-periodo.dto';

export class ActualizarPeriodoDto extends PartialType(CrearPeriodoDto) {}
