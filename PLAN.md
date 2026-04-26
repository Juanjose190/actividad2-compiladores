# PLAN.md — Sistema CAL (Cambridge Academy of Languages)

## Estado global de fases

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Bootstrap | ✅ Completada |
| 1 | Seguridad (Auth/RBAC/AuditLog) | 🔄 En planificación |
| 2 | Compartido + datos maestros | ⏳ Pendiente |
| 3 | Módulo 1: motor IA (sin Gemini) | ⏳ Pendiente |
| 4 | Módulo 1: integración Gemini | ⏳ Pendiente |
| 5 | Módulo 2: formularios y recolección | ⏳ Pendiente |
| 6 | Módulo 2: KDD + alertas + dashboard | ⏳ Pendiente |
| 7 | Frontend completo | ⏳ Pendiente |
| 8 | Hardening | ⏳ Pendiente |

---

## Fase 0 — Bootstrap

### Objetivo
Levantar el monorepo completo con estructura de carpetas, configuración base, healthcheck funcional y `docker-compose up` operativo en < 60 segundos.

### Stack confirmado
- **Backend**: TypeScript + NestJS 10 + TypeORM + PostgreSQL 16
- **Frontend**: React 18 + Vite 5 + TypeScript + TailwindCSS + shadcn/ui
- **Auth**: JWT (fase 1)
- **Orquestación**: docker-compose

### Archivos a crear

```
cal/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   └── salud/
│   │   │       ├── salud.controlador.ts   # GET /api/health
│   │   │       └── salud.modulo.ts
│   │   ├── seguridad/                     # vacío (marcador de módulo)
│   │   ├── modulo-horarios/               # vacío
│   │   ├── modulo-evaluacion/             # vacío
│   │   ├── compartido/                    # vacío
│   │   ├── app.modulo.ts
│   │   └── main.ts
│   ├── test/
│   │   └── app.e2e-spec.ts               # test del healthcheck
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── .eslintrc.js
│   ├── .prettierrc
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── modulos/
│   │   │   ├── horarios/                  # vacío
│   │   │   └── evaluacion/               # vacío
│   │   ├── seguridad/                    # vacío
│   │   ├── compartido/
│   │   │   └── api.ts                    # cliente axios base
│   │   ├── paginas/
│   │   │   └── Inicio.tsx                # consume GET /api/health
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml                        # lint + test en PR/push
├── Makefile                              # make test, make lint, make dev
├── README.md
└── PLAN.md                              # este archivo (actualizado por fase)
```

### Dependencias principales

**Backend (package.json)**
```
@nestjs/core @nestjs/common @nestjs/platform-express
@nestjs/config @nestjs/swagger
@nestjs/typeorm typeorm pg
class-validator class-transformer
reflect-metadata rxjs
```

**Dev backend**
```
@nestjs/cli @nestjs/testing
typescript ts-node ts-jest jest supertest
eslint prettier @typescript-eslint/*
```

**Frontend (package.json)**
```
react react-dom
@tanstack/react-query zustand
axios recharts
tailwindcss @tailwindcss/forms
```

**Dev frontend**
```
vite @vitejs/plugin-react
typescript eslint prettier
vitest @testing-library/react
```

### Comportamiento esperado al finalizar
1. `docker-compose up` levanta tres servicios: `db` (Postgres 16), `backend` (puerto 3000), `frontend` (puerto 5173).
2. `GET http://localhost:3000/api/health` → `{ "estado": "ok", "timestamp": "..." }` con HTTP 200.
3. `http://localhost:5173/` muestra una página con el badge "API: OK" (verde) o "API: Sin conexión" (rojo).
4. `make test` corre tests backend (Jest e2e del healthcheck) y frontend (Vitest).
5. `make lint` pasa sin warnings en backend y frontend.

### Commit único de esta fase
```
feat: bootstrap Fase 0 — estructura, NestJS, React/Vite, docker-compose, healthcheck
```

---

> **Estado**: Fase 0 completada y pusheada. ✅

---

## Fase 1 — Seguridad

### Objetivo
Autenticación JWT completa, RBAC de 3 roles, registro de sesiones y audit log inmutable que captura toda mutación.

### Archivos a crear / modificar

```
cal/backend/src/seguridad/
├── seguridad.modulo.ts                        # módulo raíz de seguridad
├── entidades/
│   ├── rol.entidad.ts                         # ROL(id, nombre, descripcion)
│   ├── permiso.entidad.ts                     # PERMISO(id, codigo UK, descripcion)
│   ├── usuario.entidad.ts                     # USUARIO(id, nombre, email UK, password_hash, rol, activo, fecha_creacion)
│   ├── sesion.entidad.ts                      # SESION(id, usuario, token_jwt, fecha_emision, fecha_expiracion, ip_origen)
│   └── audit-log.entidad.ts                   # AUDIT_LOG(id, usuario, accion, entidad, entidad_id, timestamp, datos_previos JSONB, datos_nuevos JSONB)
├── auth/
│   ├── auth.modulo.ts
│   ├── auth.controlador.ts                    # POST /api/auth/login, /refresh, /logout
│   ├── auth.servicio.ts                       # lógica login/refresh/logout + bcrypt
│   ├── auth.controlador.spec.ts
│   ├── auth.servicio.spec.ts
│   ├── estrategias/
│   │   └── jwt.estrategia.ts                  # PassportJS JWT strategy
│   ├── guardias/
│   │   ├── jwt.guardia.ts                     # AuthGuard('jwt')
│   │   ├── jwt.guardia.spec.ts
│   │   ├── roles.guardia.ts                   # verifica @Roles() contra user.rol
│   │   └── roles.guardia.spec.ts
│   └── dto/
│       ├── login.dto.ts                       # { email, contrasena }
│       └── respuesta-auth.dto.ts              # { access_token, refresh_token, rol }
├── usuarios/
│   ├── usuarios.modulo.ts
│   ├── usuarios.controlador.ts               # GET|POST|PATCH|DELETE /api/usuarios (Admin)
│   ├── usuarios.servicio.ts
│   ├── usuarios.servicio.spec.ts
│   └── dto/
│       ├── crear-usuario.dto.ts
│       ├── actualizar-usuario.dto.ts
│       └── respuesta-usuario.dto.ts
├── audit-log/
│   ├── audit-log.servicio.ts                 # registrar() — solo INSERT, nunca UPDATE/DELETE
│   ├── audit-log.servicio.spec.ts
│   └── dto/
│       └── respuesta-audit-log.dto.ts
└── decoradores/
    ├── roles.decorador.ts                    # @Roles(RolNombre.Admin, ...)
    ├── usuario-actual.decorador.ts           # @UsuarioActual() extrae JWT payload
    └── auditar.interceptor.ts               # interceptor que lee @SetMetadata('auditEntidad') y escribe AUDIT_LOG

# Archivos que se modifican:
cal/backend/src/app.modulo.ts                 # agrega SeguridadModulo
cal/backend/package.json                      # nuevas deps: bcrypt, passport, @nestjs/passport, @nestjs/jwt
```

### Dependencias nuevas
```
bcrypt @types/bcrypt
@nestjs/passport passport passport-jwt @types/passport-jwt
@nestjs/jwt
```

### Diseño de decisiones clave

| Decisión | Elección |
|----------|---------|
| Hash contraseñas | `bcrypt` con `saltRounds = 12` (configurable vía `BCRYPT_ROUNDS`) |
| JWT access token | Expira en `JWT_EXPIRACION` (default `8h`) |
| JWT refresh token | Expira en `JWT_EXPIRACION_REFRESH` (default `7d`), firmado con clave diferente |
| RBAC | `@Roles()` decorator + `RolesGuardia` que lee `user.rol` del JWT |
| Audit log | Interceptor `AuditarInterceptor` + decorator `@Auditar('ENTIDAD')` en controladores; captura `datos_previos` (query antes) y `datos_nuevos` (body/respuesta) |
| AUDIT_LOG inmutable | El `AuditLogServicio` solo expone `registrar()` — sin métodos de update/delete |
| Sesiones | Al hacer login se inserta en SESION; al logout se marca `fecha_expiracion = now()` |
| Roles iniciales | Seeder en `SeguridadModulo.onModuleInit()`: Admin, Docente, Estudiante |

### Endpoints expuestos

```
POST   /api/auth/login          → { access_token, refresh_token, rol }   [público]
POST   /api/auth/refresh        → { access_token }                        [público, requiere refresh_token]
POST   /api/auth/logout         → 204                                     [JWT]
GET    /api/usuarios            → paginado                                [Admin]
POST   /api/usuarios            → usuario creado                          [Admin]
PATCH  /api/usuarios/:id        → usuario actualizado                     [Admin]
DELETE /api/usuarios/:id        → 204                                     [Admin]
GET    /api/audit-log           → paginado, filtrable por entidad/fecha   [Admin]
```

### Tests requeridos (cobertura ≥ 80 % en `seguridad/`)

| Archivo spec | Casos |
|-------------|-------|
| `auth.servicio.spec.ts` | login válido devuelve tokens; login con email inexistente → 401; login con contraseña incorrecta → 401; refresh válido; refresh con token expirado → 401 |
| `auth.controlador.spec.ts` | POST /login 200; POST /login 401; POST /logout 204 |
| `jwt.guardia.spec.ts` | token válido pasa; token expirado → 401; sin token → 401 |
| `roles.guardia.spec.ts` | rol correcto pasa; rol incorrecto → 403 |
| `audit-log.servicio.spec.ts` | `registrar()` inserta una fila; no expone métodos de delete/update |
| `usuarios.servicio.spec.ts` | crear usuario hashea contraseña; email duplicado → 409; listar paginado |

### Migración TypeORM
- Un único archivo de migración `migrations/1_seguridad_inicial.ts` que crea las 5 tablas con todos los índices y constraints del ERD canónico.

### Commit de esta fase
```
feat: Fase 1 — seguridad, JWT, RBAC, audit log, CRUD usuarios
```

---

> **Instrucción**: Confirma este plan con "ok" para que empiece a codear.
