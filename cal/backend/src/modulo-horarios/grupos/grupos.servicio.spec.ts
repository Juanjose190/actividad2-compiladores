import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Curso } from '../entidades/curso.entidad';
import { Grupo, Jornada } from '../entidades/grupo.entidad';
import { CodigoNivel, NivelIdioma } from '../entidades/nivel-idioma.entidad';
import { GruposServicio } from './grupos.servicio';

const mockNivel = (): NivelIdioma =>
  ({ id: 1, codigo: CodigoNivel.A1, nombre: 'Principiante' }) as NivelIdioma;

const mockCurso = (): Curso =>
  ({ id: 1, nombre: 'Inglés A1', nivel: mockNivel(), intensidadHoraria: 4 }) as unknown as Curso;

const mockGrupo = (): Grupo =>
  ({ id: 1, codigo: 'G-01', curso: mockCurso(), cupoMax: 30, jornada: Jornada.Manana }) as unknown as Grupo;

describe('GruposServicio', () => {
  let servicio: GruposServicio;
  let grupoRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let cursoRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    grupoRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    cursoRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        GruposServicio,
        { provide: getRepositoryToken(Grupo), useValue: grupoRepo },
        { provide: getRepositoryToken(Curso), useValue: cursoRepo },
      ],
    }).compile();

    servicio = modulo.get(GruposServicio);
  });

  describe('crear', () => {
    it('crea el grupo cuando el curso existe', async () => {
      cursoRepo.findOne.mockResolvedValue(mockCurso());
      const g = mockGrupo();
      grupoRepo.create.mockReturnValue(g);
      grupoRepo.save.mockResolvedValue(g);

      const resultado = await servicio.crear({ codigo: 'G-01', cursoId: 1, cupoMax: 30, jornada: Jornada.Manana });
      expect(resultado.codigo).toBe('G-01');
    });

    it('lanza NotFoundException si el curso no existe', async () => {
      cursoRepo.findOne.mockResolvedValue(null);
      await expect(servicio.crear({ codigo: 'G-01', cursoId: 99, cupoMax: 30, jornada: Jornada.Tarde })).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      grupoRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      grupoRepo.findOne.mockResolvedValue(mockGrupo());
      grupoRepo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
