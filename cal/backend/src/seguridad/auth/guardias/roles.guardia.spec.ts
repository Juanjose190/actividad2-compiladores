import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolNombre } from '../../entidades/rol.entidad';
import { RolesGuardia } from './roles.guardia';

const crearContexto = (rol: string, rolesMetadata: RolNombre[] | undefined) => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(rolesMetadata) } as unknown as Reflector;
  const guardia = new RolesGuardia(reflector);
  const contexto = {
    switchToHttp: () => ({
      getRequest: () => ({ user: { rol } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { guardia, contexto };
};

describe('RolesGuardia', () => {
  it('permite acceso cuando no hay roles requeridos', () => {
    const { guardia, contexto } = crearContexto(RolNombre.Estudiante, undefined);
    expect(guardia.canActivate(contexto)).toBe(true);
  });

  it('permite acceso con el rol correcto', () => {
    const { guardia, contexto } = crearContexto(RolNombre.Admin, [RolNombre.Admin]);
    expect(guardia.canActivate(contexto)).toBe(true);
  });

  it('deniega acceso con rol incorrecto → 403', () => {
    const { guardia, contexto } = crearContexto(RolNombre.Estudiante, [RolNombre.Admin]);
    expect(guardia.canActivate(contexto)).toBe(false);
  });

  it('permite acceso cuando el rol está en la lista de roles permitidos', () => {
    const { guardia, contexto } = crearContexto(
      RolNombre.Docente,
      [RolNombre.Admin, RolNombre.Docente],
    );
    expect(guardia.canActivate(contexto)).toBe(true);
  });
});
