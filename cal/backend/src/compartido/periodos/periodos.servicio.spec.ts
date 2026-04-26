import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PeriodoAcademico } from '../entidades/periodo-academico.entidad';
import { PeriodosServicio } from './periodos.servicio';

const mockPeriodo = (): PeriodoAcademico =>
  ({ id: 1, nombre: '2024-I', fechaInicio: '2024-01-15', fechaFin: '2024-06-30' }) as PeriodoAcademico;

describe('PeriodosServicio', () => {
  let servicio: PeriodosServicio;
  let repo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodosServicio,
        { provide: getRepositoryToken(PeriodoAcademico), useValue: repo },
      ],
    }).compile();

    servicio = modulo.get(PeriodosServicio);
  });

  describe('crear', () => {
    it('crea y devuelve el periodo', async () => {
      const p = mockPeriodo();
      repo.create.mockReturnValue(p);
      repo.save.mockResolvedValue(p);

      const resultado = await servicio.crear({ nombre: '2024-I', fechaInicio: '2024-01-15', fechaFin: '2024-06-30' });
      expect(resultado.nombre).toBe('2024-I');
    });
  });

  describe('listar', () => {
    it('devuelve paginado correctamente', async () => {
      repo.findAndCount.mockResolvedValue([[mockPeriodo()], 1]);
      const resultado = await servicio.listar(1, 20);
      expect(resultado.total).toBe(1);
      expect(resultado.items).toHaveLength(1);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });

    it('devuelve el periodo si existe', async () => {
      repo.findOne.mockResolvedValue(mockPeriodo());
      const resultado = await servicio.buscarPorId(1);
      expect(resultado.id).toBe(1);
    });
  });

  describe('actualizar', () => {
    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.actualizar(99, { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('actualiza y devuelve el periodo', async () => {
      const p = mockPeriodo();
      repo.findOne.mockResolvedValue(p);
      repo.save.mockResolvedValue({ ...p, nombre: '2024-II' });
      const resultado = await servicio.actualizar(1, { nombre: '2024-II' });
      expect(resultado.nombre).toBe('2024-II');
    });
  });

  describe('eliminar', () => {
    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.eliminar(99)).rejects.toThrow(NotFoundException);
    });

    it('elimina el periodo correctamente', async () => {
      repo.findOne.mockResolvedValue(mockPeriodo());
      repo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
