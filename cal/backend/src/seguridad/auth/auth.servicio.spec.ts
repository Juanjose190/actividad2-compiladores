import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Sesion } from '../entidades/sesion.entidad';
import { Usuario } from '../entidades/usuario.entidad';
import { AuthServicio } from './auth.servicio';

const mockUsuario = {
  id: 1,
  email: 'admin@cal.edu.co',
  passwordHash: '',
  activo: true,
  nombre: 'Admin CAL',
  rol: { nombre: 'Admin' },
};

describe('AuthServicio', () => {
  let servicio: AuthServicio;
  let usuarioRepo: jest.Mocked<Repository<Usuario>>;
  let sesionRepo: jest.Mocked<Repository<Sesion>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeAll(async () => {
    mockUsuario.passwordHash = await bcrypt.hash('Secreto123!', 10);
  });

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServicio,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Sesion),
          useValue: {
            save: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockReturnValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token.mock'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def: unknown) => def),
          },
        },
      ],
    }).compile();

    servicio = modulo.get(AuthServicio);
    usuarioRepo = modulo.get(getRepositoryToken(Usuario));
    sesionRepo = modulo.get(getRepositoryToken(Sesion));
    jwtService = modulo.get(JwtService);
  });

  describe('login', () => {
    it('devuelve access_token y refresh_token con credenciales válidas', async () => {
      usuarioRepo.findOne.mockResolvedValue(mockUsuario as unknown as Usuario);

      const resultado = await servicio.login(
        { email: 'admin@cal.edu.co', contrasena: 'Secreto123!' },
        '127.0.0.1',
      );

      expect(resultado.access_token).toBeDefined();
      expect(resultado.refresh_token).toBeDefined();
      expect(resultado.rol).toBe('Admin');
    });

    it('lanza UnauthorizedException cuando el email no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        servicio.login({ email: 'noexiste@cal.edu.co', contrasena: 'cualquiera' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException cuando la contraseña es incorrecta', async () => {
      usuarioRepo.findOne.mockResolvedValue(mockUsuario as unknown as Usuario);

      await expect(
        servicio.login({ email: 'admin@cal.edu.co', contrasena: 'incorrecta' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refrescar', () => {
    it('devuelve nuevo access_token con refresh token válido', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, tipo: 'refresco' });
      usuarioRepo.findOne.mockResolvedValue(mockUsuario as unknown as Usuario);

      const resultado = await servicio.refrescar('refresh.token.mock');
      expect(resultado.access_token).toBeDefined();
    });

    it('lanza UnauthorizedException con token expirado', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(servicio.refrescar('token.expirado')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException con token de tipo acceso en lugar de refresco', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, tipo: 'acceso' });

      await expect(servicio.refrescar('token.acceso')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('marca la sesión como expirada', async () => {
      await servicio.logout(1);
      expect(sesionRepo.update).toHaveBeenCalledWith({ usuario: { id: 1 } }, expect.any(Object));
    });
  });

  describe('hashContrasena', () => {
    it('genera un hash bcrypt válido', async () => {
      const hash = await servicio.hashContrasena('MiContrasena123');
      expect(hash).toMatch(/^\$2[ab]\$/);
      const coincide = await bcrypt.compare('MiContrasena123', hash);
      expect(coincide).toBe(true);
    });
  });
});
