# PLAN.md — Sistema CAL (Cambridge Academy of Languages)

## Estado global de fases

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Bootstrap | 🔄 En planificación |
| 1 | Seguridad (Auth/RBAC/AuditLog) | ⏳ Pendiente |
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

> **Instrucción**: Confirma este plan con un "OK" o pide cambios. No escribo código hasta recibir tu visto bueno.
