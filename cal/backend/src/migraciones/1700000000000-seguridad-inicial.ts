import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeguridadInicial1700000000000 implements MigrationInterface {
  name = 'SeguridadInicial1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "rol" (
        "id" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(50) NOT NULL UNIQUE,
        "descripcion" TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "permiso" (
        "id" SERIAL PRIMARY KEY,
        "codigo" VARCHAR(100) NOT NULL UNIQUE,
        "descripcion" TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rol_permiso" (
        "rol_id" INTEGER NOT NULL REFERENCES "rol"("id") ON DELETE RESTRICT,
        "permiso_id" INTEGER NOT NULL REFERENCES "permiso"("id") ON DELETE RESTRICT,
        PRIMARY KEY ("rol_id", "permiso_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "usuario" (
        "id" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(200) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "rol_id" INTEGER NOT NULL REFERENCES "rol"("id") ON DELETE RESTRICT,
        "activo" BOOLEAN NOT NULL DEFAULT TRUE,
        "fecha_creacion" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sesion" (
        "id" SERIAL PRIMARY KEY,
        "usuario_id" INTEGER NOT NULL REFERENCES "usuario"("id") ON DELETE RESTRICT,
        "token_jwt" TEXT NOT NULL,
        "fecha_emision" TIMESTAMPTZ NOT NULL,
        "fecha_expiracion" TIMESTAMPTZ NOT NULL,
        "ip_origen" VARCHAR(45)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" SERIAL PRIMARY KEY,
        "usuario_id" INTEGER REFERENCES "usuario"("id") ON DELETE RESTRICT,
        "accion" VARCHAR(10) NOT NULL,
        "entidad" VARCHAR(100) NOT NULL,
        "entidad_id" VARCHAR(255),
        "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "datos_previos" JSONB,
        "datos_nuevos" JSONB
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_asignacion_docente_franja" ON "audit_log" ("entidad", "usuario_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sesion"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuario"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rol_permiso"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permiso"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rol"`);
  }
}
