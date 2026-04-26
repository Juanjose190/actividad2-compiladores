import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SaludModulo } from '../src/core/salud/salud.modulo';

describe('Salud (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SaludModulo],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/health devuelve 200 con estado ok', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.estado).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.version).toBe('0.1.0');
      });
  });

  it('GET /api/health devuelve Content-Type JSON', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect('Content-Type', /json/);
  });
});
