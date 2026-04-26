import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Usuario } from '../../seguridad/entidades/usuario.entidad';
import { Estudiante } from '../entidades/estudiante.entidad';
import { EstudiantesServicio } from './estudiantes.servicio';

const mockUsuario = (): Usuario =>
  ({ id: 1, nombre: 'Ana López', email: 'ana@cal.edu.co', rol: { nombre: 'Estudiante' }, activo: true, fechaCreacion: new Date() }) as unknown as Usuario;

const mockEstudiante = (): Estudiante =>
  ({ id: 1, usuario: mockUsuario(), grupoId: null }) as unknown as Estudiante;

describe('EstudiantesServicio', () => {
  let servicio: EstudiantesServicio;
  let estudianteRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let usuarioRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    estudianteRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    usuarioRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        EstudiantesServicio,
        { provide: getRepositoryToken(Estudiante), useValue: estudianteRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
      ],
    }).compile();

    servicio = modulo.get(EstudiantesServicio);
  });

  describe('crear', () => {
    it('crea el estudiante cuando el usuario existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(mockUsuario());
      const e = mockEstudiante();
      estudianteRepo.create.mockReturnValue(e);
      estudianteRepo.save.mockResolvedValue(e);

      const resultado = await servicio.crear({ usuarioId: 1 });
      expect(resultado.usuarioNombre).toBe('Ana López');
      expect(resultado.grupoId).toBeNull();
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      await expect(servicio.crear({ usuarioId: 99 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar', () => {
    it('devuelve paginado', async () => {
      estudianteRepo.findAndCount.mockResolvedValue([[mockEstudiante()], 1]);
      const resultado = await servicio.listar(1, 20);
      expect(resultado.total).toBe(1);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      estudianteRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      estudianteRepo.findOne.mockResolvedValue(mockEstudiante());
      estudianteRepo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });

    it('lanza NotFoundException si no existe', async () => {
      estudianteRepo.findOne.mockResolvedValue(null);
      await expect(servicio.eliminar(99)).rejects.toThrow(NotFoundException);
    });
  });
});
