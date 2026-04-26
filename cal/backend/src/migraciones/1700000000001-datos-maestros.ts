import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatosMaestros1700000000001 implements MigrationInterface {
  name = 'DatosMaestros1700000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."tipo_aula_enum" AS ENUM ('SALON', 'LAB', 'VIRTUAL')
    `);

    await queryRunner.query(`
      CREATE TABLE "aula" (
        "id"       SERIAL NOT NULL,
        "codigo"   VARCHAR(20) NOT NULL,
        "capacidad" INTEGER NOT NULL,
        "tipo"     "public"."tipo_aula_enum" NOT NULL DEFAULT 'SALON',
        "activa"   BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "UQ_aula_codigo" UNIQUE ("codigo"),
        CONSTRAINT "PK_aula" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."codigo_nivel_enum" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1')
    `);

    await queryRunner.query(`
      CREATE TABLE "nivel_idioma" (
        "id"     SERIAL NOT NULL,
        "codigo" "public"."codigo_nivel_enum" NOT NULL,
        "nombre" VARCHAR(100) NOT NULL,
        CONSTRAINT "UQ_nivel_idioma_codigo" UNIQUE ("codigo"),
        CONSTRAINT "PK_nivel_idioma" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "curso" (
        "id"                SERIAL NOT NULL,
        "nombre"            VARCHAR(200) NOT NULL,
        "nivel_id"          INTEGER NOT NULL,
        "intensidad_horaria" INTEGER NOT NULL,
        CONSTRAINT "PK_curso" PRIMARY KEY ("id"),
        CONSTRAINT "FK_curso_nivel" FOREIGN KEY ("nivel_id")
          REFERENCES "nivel_idioma" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."jornada_enum" AS ENUM ('MANANA', 'TARDE', 'NOCHE')
    `);

    await queryRunner.query(`
      CREATE TABLE "grupo" (
        "id"       SERIAL NOT NULL,
        "codigo"   VARCHAR(20) NOT NULL,
        "curso_id" INTEGER NOT NULL,
        "cupo_max" INTEGER NOT NULL,
        "jornada"  "public"."jornada_enum" NOT NULL,
        CONSTRAINT "PK_grupo" PRIMARY KEY ("id"),
        CONSTRAINT "FK_grupo_curso" FOREIGN KEY ("curso_id")
          REFERENCES "curso" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."dia_semana_enum" AS ENUM ('LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB')
    `);

    await queryRunner.query(`
      CREATE TABLE "franja_horaria" (
        "id"          SERIAL NOT NULL,
        "dia_semana"  "public"."dia_semana_enum" NOT NULL,
        "hora_inicio" TIME NOT NULL,
        "hora_fin"    TIME NOT NULL,
        "bloque_idx"  INTEGER NOT NULL,
        CONSTRAINT "PK_franja_horaria" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "docente" (
        "id"                 SERIAL NOT NULL,
        "usuario_id"         INTEGER NOT NULL,
        "especialidad"       VARCHAR(200),
        "carga_maxima_horas" INTEGER NOT NULL DEFAULT 40,
        CONSTRAINT "PK_docente" PRIMARY KEY ("id"),
        CONSTRAINT "FK_docente_usuario" FOREIGN KEY ("usuario_id")
          REFERENCES "usuario" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "estudiante" (
        "id"         SERIAL NOT NULL,
        "usuario_id" INTEGER NOT NULL,
        "grupo_id"   INTEGER,
        CONSTRAINT "PK_estudiante" PRIMARY KEY ("id"),
        CONSTRAINT "FK_estudiante_usuario" FOREIGN KEY ("usuario_id")
          REFERENCES "usuario" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "periodo_academico" (
        "id"           SERIAL NOT NULL,
        "nombre"       VARCHAR(100) NOT NULL,
        "fecha_inicio" DATE NOT NULL,
        "fecha_fin"    DATE NOT NULL,
        CONSTRAINT "PK_periodo_academico" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "disponibilidad" (
        "id"               SERIAL NOT NULL,
        "docente_id"       INTEGER NOT NULL,
        "franja_horaria_id" INTEGER NOT NULL,
        "disponible"       BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "PK_disponibilidad" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_disponibilidad" UNIQUE ("docente_id", "franja_horaria_id"),
        CONSTRAINT "FK_disp_docente" FOREIGN KEY ("docente_id")
          REFERENCES "docente" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_disp_franja" FOREIGN KEY ("franja_horaria_id")
          REFERENCES "franja_horaria" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_disponibilidad_docente" ON "disponibilidad" ("docente_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_curso_nivel" ON "curso" ("nivel_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_grupo_curso" ON "grupo" ("curso_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_grupo_curso"`);
    await queryRunner.query(`DROP INDEX "IDX_curso_nivel"`);
    await queryRunner.query(`DROP INDEX "IDX_disponibilidad_docente"`);
    await queryRunner.query(`DROP TABLE "disponibilidad"`);
    await queryRunner.query(`DROP TABLE "periodo_academico"`);
    await queryRunner.query(`DROP TABLE "estudiante"`);
    await queryRunner.query(`DROP TABLE "docente"`);
    await queryRunner.query(`DROP TABLE "franja_horaria"`);
    await queryRunner.query(`DROP TABLE "grupo"`);
    await queryRunner.query(`DROP TYPE "public"."jornada_enum"`);
    await queryRunner.query(`DROP TABLE "curso"`);
    await queryRunner.query(`DROP TABLE "nivel_idioma"`);
    await queryRunner.query(`DROP TYPE "public"."codigo_nivel_enum"`);
    await queryRunner.query(`DROP TABLE "aula"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_aula_enum"`);
    await queryRunner.query(`DROP TYPE "public"."dia_semana_enum"`);
  }
}
