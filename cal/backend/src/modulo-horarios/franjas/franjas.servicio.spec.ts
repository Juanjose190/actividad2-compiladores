import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DiaSemana, FranjaHoraria } from '../entidades/franja-horaria.entidad';
import { FranjasServicio } from './franjas.servicio';

const mockFranja = (): FranjaHoraria =>
  ({ id: 1, diaSemana: DiaSemana.Lunes, horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 1 }) as FranjaHoraria;

describe('FranjasServicio', () => {
  let servicio: FranjasServicio;
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
        FranjasServicio,
        { provide: getRepositoryToken(FranjaHoraria), useValue: repo },
      ],
    }).compile();

    servicio = modulo.get(FranjasServicio);
  });

  describe('crear', () => {
    it('crea la franja correctamente', async () => {
      const f = mockFranja();
      repo.create.mockReturnValue(f);
      repo.save.mockResolvedValue(f);

      const resultado = await servicio.crear({ diaSemana: DiaSemana.Lunes, horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 1 });
      expect(resultado.diaSemana).toBe(DiaSemana.Lunes);
    });
  });

  describe('listar', () => {
    it('devuelve paginado', async () => {
      repo.findAndCount.mockResolvedValue([[mockFranja()], 1]);
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

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      repo.findOne.mockResolvedValue(mockFranja());
      repo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
