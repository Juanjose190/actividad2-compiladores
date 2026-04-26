import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Rol, RolNombre } from '../entidades/rol.entidad';
import { Usuario } from '../entidades/usuario.entidad';
import { AuthServicio } from '../auth/auth.servicio';
import { UsuariosServicio } from './usuarios.servicio';

const mockRol = { id: 1, nombre: RolNombre.Admin };

const crearUsuarioMock = (overrides = {}): Usuario =>
  ({
    id: 1,
    nombre: 'Admin Test',
    email: 'admin@cal.edu.co',
    passwordHash: '$2b$12$mock',
    rol: mockRol,
    activo: true,
    fechaCreacion: new Date(),
    sesiones: [],
    ...overrides,
  }) as unknown as Usuario;

describe('UsuariosServicio', () => {
  let servicio: UsuariosServicio;
  let usuarioRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let rolRepo: { findOne: jest.Mock };
  let authServicio: { hashContrasena: jest.Mock };

  beforeEach(async () => {
    usuarioRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    rolRepo = { findOne: jest.fn() };
    authServicio = { hashContrasena: jest.fn().mockResolvedValue('$2b$12$hash') };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosServicio,
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
        { provide: getRepositoryToken(Rol), useValue: rolRepo },
        { provide: AuthServicio, useValue: authServicio },
      ],
    }).compile();

    servicio = modulo.get(UsuariosServicio);
  });

  describe('crear', () => {
    it('crea usuario y hashea la contraseña', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      rolRepo.findOne.mockResolvedValue(mockRol);
      const usuario = crearUsuarioMock();
      usuarioRepo.create.mockReturnValue(usuario);
      usuarioRepo.save.mockResolvedValue(usuario);

      const resultado = await servicio.crear({
        nombre: 'Admin Test',
        email: 'admin@cal.edu.co',
        contrasena: 'Secreto123!',
        rol: RolNombre.Admin,
      });

      expect(authServicio.hashContrasena).toHaveBeenCalledWith('Secreto123!');
      expect(resultado.email).toBe('admin@cal.edu.co');
    });

    it('lanza ConflictException si el email ya existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(crearUsuarioMock());

      await expect(
        servicio.crear({
          nombre: 'Otro',
          email: 'admin@cal.edu.co',
          contrasena: 'Pass1234!',
          rol: RolNombre.Docente,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('lanza NotFoundException si el rol no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      rolRepo.findOne.mockResolvedValue(null);

      await expect(
        servicio.crear({
          nombre: 'Test',
          email: 'nuevo@cal.edu.co',
          contrasena: 'Pass1234!',
          rol: RolNombre.Admin,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar', () => {
    it('devuelve paginado correctamente', async () => {
      const usuarios = [crearUsuarioMock()];
      usuarioRepo.findAndCount.mockResolvedValue([usuarios, 1]);

      const resultado = await servicio.listar(1, 20);
      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(resultado.page).toBe(1);
      expect(resultado.size).toBe(20);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('actualiza campos básicos del usuario', async () => {
      const usuario = crearUsuarioMock();
      usuarioRepo.findOne.mockResolvedValue(usuario);
      usuarioRepo.save.mockResolvedValue({ ...usuario, nombre: 'Nuevo Nombre' });

      const resultado = await servicio.actualizar(1, { nombre: 'Nuevo Nombre' });
      expect(resultado.nombre).toBe('Nuevo Nombre');
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      await expect(servicio.actualizar(999, { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el email ya está en uso por otro usuario', async () => {
      const usuario = crearUsuarioMock({ id: 1, email: 'original@cal.edu.co' });
      const duplicado = crearUsuarioMock({ id: 2, email: 'ocupado@cal.edu.co' });
      usuarioRepo.findOne
        .mockResolvedValueOnce(usuario)
        .mockResolvedValueOnce(duplicado);

      await expect(
        servicio.actualizar(1, { email: 'ocupado@cal.edu.co' }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashea la contraseña cuando se actualiza', async () => {
      const usuario = crearUsuarioMock();
      usuarioRepo.findOne.mockResolvedValue(usuario);
      usuarioRepo.save.mockResolvedValue(usuario);

      await servicio.actualizar(1, { contrasena: 'NuevaClave123!' });
      expect(authServicio.hashContrasena).toHaveBeenCalledWith('NuevaClave123!');
    });

    it('actualiza el rol si se proporciona uno válido', async () => {
      const usuario = crearUsuarioMock();
      const nuevoRol = { id: 2, nombre: RolNombre.Docente };
      usuarioRepo.findOne.mockResolvedValue(usuario);
      rolRepo.findOne.mockResolvedValue(nuevoRol);
      usuarioRepo.save.mockResolvedValue({ ...usuario, rol: nuevoRol });

      const resultado = await servicio.actualizar(1, { rol: RolNombre.Docente });
      expect(resultado.rol).toBe(RolNombre.Docente);
    });
  });

  describe('eliminar', () => {
    it('elimina el usuario correctamente', async () => {
      const usuario = crearUsuarioMock();
      usuarioRepo.findOne.mockResolvedValue(usuario);
      usuarioRepo.remove.mockResolvedValue(usuario);

      await expect(servicio.eliminar(1)).resolves.not.toThrow();
      expect(usuarioRepo.remove).toHaveBeenCalledWith(usuario);
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      await expect(servicio.eliminar(999)).rejects.toThrow(NotFoundException);
    });
  });
});
