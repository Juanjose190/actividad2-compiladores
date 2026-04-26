import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuardia } from './jwt.guardia';

describe('JwtGuardia', () => {
  let guardia: JwtGuardia;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [JwtGuardia],
    }).compile();

    guardia = modulo.get(JwtGuardia);
  });

  it('debería estar definida', () => {
    expect(guardia).toBeDefined();
  });

  it('debería extender AuthGuard jwt', () => {
    const Padre = Object.getPrototypeOf(JwtGuardia);
    expect(Padre).toBe(AuthGuard('jwt'));
  });

  it('canActivate debería estar definido como función', () => {
    expect(typeof guardia.canActivate).toBe('function');
  });

  it('rechaza contexto sin token (mocked)', async () => {
    const contexto = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      getType: () => 'http',
      getArgByIndex: () => ({}),
      getArgs: () => [],
      switchToRpc: () => ({}),
      switchToWs: () => ({}),
    } as unknown as ExecutionContext;

    await expect(guardia.canActivate(contexto)).rejects.toThrow();
  });
});
