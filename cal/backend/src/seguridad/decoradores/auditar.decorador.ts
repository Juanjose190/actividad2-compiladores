import { SetMetadata } from '@nestjs/common';

export const AUDIT_ENTIDAD_KEY = 'auditEntidad';

export const Auditar = (entidad: string) => SetMetadata(AUDIT_ENTIDAD_KEY, entidad);
