import { Test, TestingModule } from '@nestjs/testing';
import { SaludControlador } from './salud.controlador';

describe('SaludControlador', () => {
  let controlador: SaludControlador;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [SaludControlador],
    }).compile();

    controlador = modulo.get<SaludControlador>(SaludControlador);
  });

  it('debería estar definido', () => {
    expect(controlador).toBeDefined();
  });

  it('debería retornar estado ok', () => {
    const resultado = controlador.verificar();
    expect(resultado.estado).toBe('ok');
    expect(resultado.timestamp).toBeDefined();
    expect(resultado.version).toBe('0.1.0');
  });

  it('debería retornar un timestamp ISO válido', () => {
    const resultado = controlador.verificar();
    expect(() => new Date(resultado.timestamp)).not.toThrow();
    expect(new Date(resultado.timestamp).getTime()).not.toBeNaN();
  });
});
