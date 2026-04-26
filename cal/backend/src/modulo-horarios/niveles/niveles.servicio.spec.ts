import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CodigoNivel, NivelIdioma } from '../entidades/nivel-idioma.entidad';
import { NivelesServicio } from './niveles.servicio';

const mockNivel = (): NivelIdioma =>
  ({ id: 1, codigo: CodigoNivel.A1, nombre: 'Principiante' }) as NivelIdioma;

describe('NivelesServicio', () => {
  let servicio: NivelesServicio;
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
        NivelesServicio,
        { provide: getRepositoryToken(NivelIdioma), useValue: repo },
      ],
    }).compile();

    servicio = modulo.get(NivelesServicio);
  });

  describe('crear', () => {
    it('crea el nivel correctamente', async () => {
      repo.findOne.mockResolvedValue(null);
      const n = mockNivel();
      repo.create.mockReturnValue(n);
      repo.save.mockResolvedValue(n);

      const resultado = await servicio.crear({ codigo: CodigoNivel.A1, nombre: 'Principiante' });
      expect(resultado.codigo).toBe(CodigoNivel.A1);
    });

    it('lanza ConflictException si el código ya existe', async () => {
      repo.findOne.mockResolvedValue(mockNivel());
      await expect(servicio.crear({ codigo: CodigoNivel.A1, nombre: 'X' })).rejects.toThrow(ConflictException);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      repo.findOne.mockResolvedValue(mockNivel());
      repo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
