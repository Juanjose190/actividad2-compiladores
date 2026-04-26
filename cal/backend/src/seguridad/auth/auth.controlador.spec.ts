import { Test, TestingModule } from '@nestjs/testing';
import { AuthControlador } from './auth.controlador';
import { AuthServicio } from './auth.servicio';

const mockAuthServicio = {
  login: jest.fn().mockResolvedValue({
    access_token: 'access.mock',
    refresh_token: 'refresh.mock',
    rol: 'Admin',
  }),
  refrescar: jest.fn().mockResolvedValue({ access_token: 'nuevo.access.mock' }),
  logout: jest.fn().mockResolvedValue(undefined),
};

describe('AuthControlador', () => {
  let controlador: AuthControlador;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [AuthControlador],
      providers: [{ provide: AuthServicio, useValue: mockAuthServicio }],
    }).compile();

    controlador = modulo.get(AuthControlador);
  });

  it('debería estar definido', () => {
    expect(controlador).toBeDefined();
  });

  describe('login', () => {
    it('devuelve tokens con credenciales válidas', async () => {
      const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } } as never;
      const resultado = await controlador.login(
        { email: 'admin@cal.edu.co', contrasena: 'Secreto123!' },
        req,
      );
      expect(resultado.access_token).toBe('access.mock');
      expect(resultado.refresh_token).toBe('refresh.mock');
      expect(resultado.rol).toBe('Admin');
    });
  });

  describe('refrescar', () => {
    it('devuelve nuevo access_token', async () => {
      const resultado = await controlador.refrescar({ refresh_token: 'refresh.mock' });
      expect(resultado.access_token).toBe('nuevo.access.mock');
    });
  });

  describe('logout', () => {
    it('llama al servicio de logout', async () => {
      await controlador.logout({ id: 1, email: 'admin@cal.edu.co', rol: 'Admin' });
      expect(mockAuthServicio.logout).toHaveBeenCalledWith(1);
    });
  });
});
