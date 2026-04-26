import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Disponibilidad } from '../entidades/disponibilidad.entidad';
import { DiaSemana, FranjaHoraria } from '../entidades/franja-horaria.entidad';
import { DisponibilidadesServicio } from './disponibilidades.servicio';

const mockDocente = (): Docente =>
  ({ id: 1, usuario: { id: 1, nombre: 'Juan', email: 'juan@cal.edu.co' }, especialidad: null, cargaMaximaHoras: 40 }) as unknown as Docente;

const mockFranja = (): FranjaHoraria =>
  ({ id: 1, diaSemana: DiaSemana.Lunes, horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 1 }) as FranjaHoraria;

const mockDisp = (): Disponibilidad =>
  ({ id: 1, docente: mockDocente(), franjaHoraria: mockFranja(), disponible: true }) as unknown as Disponibilidad;

describe('DisponibilidadesServicio', () => {
  let servicio: DisponibilidadesServicio;
  let dispRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let docenteRepo: { findOne: jest.Mock };
  let franjaRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    dispRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    docenteRepo = { findOne: jest.fn() };
    franjaRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        DisponibilidadesServicio,
        { provide: getRepositoryToken(Disponibilidad), useValue: dispRepo },
        { provide: getRepositoryToken(Docente), useValue: docenteRepo },
        { provide: getRepositoryToken(FranjaHoraria), useValue: franjaRepo },
      ],
    }).compile();

    servicio = modulo.get(DisponibilidadesServicio);
  });

  describe('crear', () => {
    it('crea la disponibilidad cuando docente y franja existen', async () => {
      docenteRepo.findOne.mockResolvedValue(mockDocente());
      franjaRepo.findOne.mockResolvedValue(mockFranja());
      dispRepo.findOne.mockResolvedValue(null);
      const d = mockDisp();
      dispRepo.create.mockReturnValue(d);
      dispRepo.save.mockResolvedValue(d);

      const resultado = await servicio.crear({ docenteId: 1, franjaHorariaId: 1 });
      expect(resultado.disponible).toBe(true);
    });

    it('lanza NotFoundException si el docente no existe', async () => {
      docenteRepo.findOne.mockResolvedValue(null);
      await expect(servicio.crear({ docenteId: 99, franjaHorariaId: 1 })).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si la franja no existe', async () => {
      docenteRepo.findOne.mockResolvedValue(mockDocente());
      franjaRepo.findOne.mockResolvedValue(null);
      await expect(servicio.crear({ docenteId: 1, franjaHorariaId: 99 })).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si ya existe la combinación', async () => {
      docenteRepo.findOne.mockResolvedValue(mockDocente());
      franjaRepo.findOne.mockResolvedValue(mockFranja());
      dispRepo.findOne.mockResolvedValue(mockDisp());
      await expect(servicio.crear({ docenteId: 1, franjaHorariaId: 1 })).rejects.toThrow(ConflictException);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      dispRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      dispRepo.findOne.mockResolvedValue(mockDisp());
      dispRepo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
