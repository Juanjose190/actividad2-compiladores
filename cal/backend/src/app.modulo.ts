import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompartidoModulo } from './compartido/compartido.modulo';
import { SaludModulo } from './core/salud/salud.modulo';
import { ModuloHorariosModulo } from './modulo-horarios/modulo-horarios.modulo';
import { SeguridadModulo } from './seguridad/seguridad.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USUARIO', 'cal_usuario'),
        password: config.get<string>('DB_CONTRASENA', 'cal_contrasena'),
        database: config.get<string>('DB_NOMBRE', 'cal_db'),
        entities: [__dirname + '/**/*.entidad{.ts,.js}'],
        migrations: [__dirname + '/migraciones/*{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    SaludModulo,
    SeguridadModulo,
    CompartidoModulo,
    ModuloHorariosModulo,
  ],
})
export class AppModulo {}
