import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Aula, TipoAula } from '../entidades/aula.entidad';
import { AulasServicio } from './aulas.servicio';

const mockAula = (): Aula =>
  ({ id: 1, codigo: 'A-101', capacidad: 30, tipo: TipoAula.Salon, activa: true }) as Aula;

describe('AulasServicio', () => {
  let servicio: AulasServicio;
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
        AulasServicio,
        { provide: getRepositoryToken(Aula), useValue: repo },
      ],
    }).compile();

    servicio = modulo.get(AulasServicio);
  });

  describe('crear', () => {
    it('crea el aula correctamente', async () => {
      repo.findOne.mockResolvedValue(null);
      const a = mockAula();
      repo.create.mockReturnValue(a);
      repo.save.mockResolvedValue(a);

      const resultado = await servicio.crear({ codigo: 'A-101', capacidad: 30, tipo: TipoAula.Salon });
      expect(resultado.codigo).toBe('A-101');
    });

    it('lanza ConflictException si el código ya existe', async () => {
      repo.findOne.mockResolvedValue(mockAula());
      await expect(servicio.crear({ codigo: 'A-101', capacidad: 30, tipo: TipoAula.Salon })).rejects.toThrow(ConflictException);
    });
  });

  describe('listar', () => {
    it('devuelve paginado', async () => {
      repo.findAndCount.mockResolvedValue([[mockAula()], 1]);
      const resultado = await servicio.listar(1, 20);
      expect(resultado.total).toBe(1);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('actualiza capacidad', async () => {
      const a = mockAula();
      repo.findOne.mockResolvedValue(a);
      repo.save.mockResolvedValue({ ...a, capacidad: 40 });

      const resultado = await servicio.actualizar(1, { capacidad: 40 });
      expect(resultado.capacidad).toBe(40);
    });

    it('lanza ConflictException si el nuevo código ya existe', async () => {
      const a = mockAula();
      const otro = { ...mockAula(), id: 2, codigo: 'B-202' };
      repo.findOne.mockResolvedValueOnce(a).mockResolvedValueOnce(otro);
      await expect(servicio.actualizar(1, { codigo: 'B-202' })).rejects.toThrow(ConflictException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      repo.findOne.mockResolvedValue(mockAula());
      repo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
