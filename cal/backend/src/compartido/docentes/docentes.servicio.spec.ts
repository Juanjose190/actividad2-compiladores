import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Usuario } from '../../seguridad/entidades/usuario.entidad';
import { Docente } from '../entidades/docente.entidad';
import { DocentesServicio } from './docentes.servicio';

const mockUsuario = (): Usuario =>
  ({ id: 1, nombre: 'Juan Pérez', email: 'juan@cal.edu.co', rol: { nombre: 'Docente' }, activo: true, fechaCreacion: new Date() }) as unknown as Usuario;

const mockDocente = (): Docente =>
  ({ id: 1, usuario: mockUsuario(), especialidad: 'Inglés', cargaMaximaHoras: 40 }) as unknown as Docente;

describe('DocentesServicio', () => {
  let servicio: DocentesServicio;
  let docenteRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let usuarioRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    docenteRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    usuarioRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        DocentesServicio,
        { provide: getRepositoryToken(Docente), useValue: docenteRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
      ],
    }).compile();

    servicio = modulo.get(DocentesServicio);
  });

  describe('crear', () => {
    it('crea el docente cuando el usuario existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(mockUsuario());
      const d = mockDocente();
      docenteRepo.create.mockReturnValue(d);
      docenteRepo.save.mockResolvedValue(d);

      const resultado = await servicio.crear({ usuarioId: 1, especialidad: 'Inglés' });
      expect(resultado.usuarioNombre).toBe('Juan Pérez');
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      await expect(servicio.crear({ usuarioId: 99 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar', () => {
    it('devuelve paginado', async () => {
      docenteRepo.findAndCount.mockResolvedValue([[mockDocente()], 1]);
      const resultado = await servicio.listar(1, 20);
      expect(resultado.total).toBe(1);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      docenteRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('lanza NotFoundException si no existe', async () => {
      docenteRepo.findOne.mockResolvedValue(null);
      await expect(servicio.actualizar(99, {})).rejects.toThrow(NotFoundException);
    });

    it('actualiza especialidad', async () => {
      const d = mockDocente();
      docenteRepo.findOne.mockResolvedValue(d);
      docenteRepo.save.mockResolvedValue({ ...d, especialidad: 'Francés' });

      const resultado = await servicio.actualizar(1, { especialidad: 'Francés' });
      expect(resultado.especialidad).toBe('Francés');
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      docenteRepo.findOne.mockResolvedValue(mockDocente());
      docenteRepo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });

    it('lanza NotFoundException si no existe', async () => {
      docenteRepo.findOne.mockResolvedValue(null);
      await expect(servicio.eliminar(99)).rejects.toThrow(NotFoundException);
    });
  });
});
