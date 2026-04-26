import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLog } from '../entidades/audit-log.entidad';
import { AuditLogServicio } from './audit-log.servicio';

describe('AuditLogServicio', () => {
  let servicio: AuditLogServicio;
  let auditLogRepo: { create: jest.Mock; save: jest.Mock; findAndCount: jest.Mock };

  beforeEach(async () => {
    auditLogRepo = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({ id: 1 }),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogServicio,
        { provide: getRepositoryToken(AuditLog), useValue: auditLogRepo },
      ],
    }).compile();

    servicio = modulo.get(AuditLogServicio);
  });

  it('debería estar definido', () => {
    expect(servicio).toBeDefined();
  });

  describe('registrar', () => {
    it('inserta una fila en audit_log', async () => {
      await servicio.registrar({
        usuarioId: 1,
        accion: 'POST',
        entidad: 'USUARIO',
        entidadId: '5',
        datosNuevos: { nombre: 'Test' },
      });

      expect(auditLogRepo.create).toHaveBeenCalled();
      expect(auditLogRepo.save).toHaveBeenCalled();
    });

    it('no expone método update en el repositorio de audit', () => {
      expect((auditLogRepo as Record<string, unknown>)['update']).toBeUndefined();
      expect((auditLogRepo as Record<string, unknown>)['delete']).toBeUndefined();
    });

    it('acepta datosPrevios y datosNuevos nulos', async () => {
      await expect(
        servicio.registrar({ accion: 'DELETE', entidad: 'USUARIO', entidadId: '1' }),
      ).resolves.not.toThrow();
    });
  });

  describe('listar', () => {
    it('devuelve paginado correctamente', async () => {
      const resultado = await servicio.listar(1, 20, {});
      expect(resultado.page).toBe(1);
      expect(resultado.size).toBe(20);
      expect(resultado.items).toEqual([]);
    });
  });
});
