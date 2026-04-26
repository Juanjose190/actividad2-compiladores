import { SetMetadata } from '@nestjs/common';
import { RolNombre } from '../entidades/rol.entidad';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolNombre[]) => SetMetadata(ROLES_KEY, roles);
