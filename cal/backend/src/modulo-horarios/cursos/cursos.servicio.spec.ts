import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Curso } from '../entidades/curso.entidad';
import { CodigoNivel, NivelIdioma } from '../entidades/nivel-idioma.entidad';
import { CursosServicio } from './cursos.servicio';

const mockNivel = (): NivelIdioma =>
  ({ id: 1, codigo: CodigoNivel.A1, nombre: 'Principiante' }) as NivelIdioma;

const mockCurso = (): Curso =>
  ({ id: 1, nombre: 'Inglés A1', nivel: mockNivel(), intensidadHoraria: 4 }) as unknown as Curso;

describe('CursosServicio', () => {
  let servicio: CursosServicio;
  let cursoRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let nivelRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    cursoRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    nivelRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        CursosServicio,
        { provide: getRepositoryToken(Curso), useValue: cursoRepo },
        { provide: getRepositoryToken(NivelIdioma), useValue: nivelRepo },
      ],
    }).compile();

    servicio = modulo.get(CursosServicio);
  });

  describe('crear', () => {
    it('crea el curso cuando el nivel existe', async () => {
      nivelRepo.findOne.mockResolvedValue(mockNivel());
      const c = mockCurso();
      cursoRepo.create.mockReturnValue(c);
      cursoRepo.save.mockResolvedValue(c);

      const resultado = await servicio.crear({ nombre: 'Inglés A1', nivelId: 1, intensidadHoraria: 4 });
      expect(resultado.nombre).toBe('Inglés A1');
    });

    it('lanza NotFoundException si el nivel no existe', async () => {
      nivelRepo.findOne.mockResolvedValue(null);
      await expect(servicio.crear({ nombre: 'Test', nivelId: 99, intensidadHoraria: 4 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      cursoRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      cursoRepo.findOne.mockResolvedValue(mockCurso());
      cursoRepo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
