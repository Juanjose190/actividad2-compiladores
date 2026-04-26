import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { UsuarioAutenticado } from '../auth/estrategias/jwt.estrategia';
import { AuditLogServicio } from '../audit-log/audit-log.servicio';
import { AUDIT_ENTIDAD_KEY } from './auditar.decorador';

const METODOS_MUTACION = ['POST', 'PATCH', 'PUT', 'DELETE'];
const CAMPOS_SENSIBLES = ['contrasena', 'passwordHash', 'password', 'token'];

function limpiarSensibles(obj: Record<string, unknown>): Record<string, unknown> {
  const copia = { ...obj };
  for (const campo of CAMPOS_SENSIBLES) {
    if (campo in copia) delete copia[campo];
  }
  return copia;
}

@Injectable()
export class AuditarInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogServicio: AuditLogServicio,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entidad = this.reflector.get<string>(AUDIT_ENTIDAD_KEY, context.getHandler());

    if (!entidad) return next.handle();

    const req = context.switchToHttp().getRequest<Request & { user?: UsuarioAutenticado }>();

    if (!METODOS_MUTACION.includes(req.method)) return next.handle();

    const datosEntrada = req.body && typeof req.body === 'object'
      ? limpiarSensibles(req.body as Record<string, unknown>)
      : null;

    return next.handle().pipe(
      tap((respuesta: unknown) => {
        const entidadId =
          (req.params?.['id'] as string) ??
          (respuesta && typeof respuesta === 'object'
            ? String((respuesta as Record<string, unknown>)['id'] ?? '')
            : null);

        const datosNuevos =
          respuesta && typeof respuesta === 'object'
            ? limpiarSensibles(respuesta as Record<string, unknown>)
            : datosEntrada;

        this.auditLogServicio
          .registrar({
            usuarioId: req.user?.id ?? null,
            accion: req.method,
            entidad,
            entidadId: entidadId || null,
            datosPrevios: null,
            datosNuevos,
          })
          .catch(() => {
            // no interrumpir el flujo principal si el audit falla
          });
      }),
    );
  }
}
