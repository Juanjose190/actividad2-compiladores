import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RolNombre } from '../../entidades/rol.entidad';

export class CrearUsuarioDto {
  @ApiProperty({ example: 'María García' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'maria@cal.edu.co' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({ example: 'Secreto123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

  @ApiProperty({ enum: RolNombre, example: RolNombre.Docente })
  @IsIn(Object.values(RolNombre), { message: 'El rol debe ser Admin, Docente o Estudiante' })
  rol: RolNombre;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
