# Sistema CAL — Cambridge Academy of Languages

Sistema académico para gestión de horarios con IA y evaluación docente digital.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | TypeScript + NestJS 10 + TypeORM |
| Base de datos | PostgreSQL 16 |
| Frontend | React 18 + Vite 5 + TailwindCSS |
| Estado/fetch | TanStack Query + Zustand |
| Charts | Recharts |
| Auth | JWT |
| IA | Gemini Flash 2.5 (Fase 4) |

## Requisitos

- Docker y Docker Compose
- Node.js 20+ (solo para desarrollo local sin Docker)

## Levantar con Docker (recomendado)

```bash
cp .env.example .env
# Edita .env con tus valores antes de continuar
docker-compose up
```

| Servicio | URL |
|---------|-----|
| API REST | http://localhost:3000/api |
| Documentación Swagger | http://localhost:3000/api/docs |
| Frontend | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

## Desarrollo local (sin Docker)

```bash
# Requiere PostgreSQL 16 corriendo localmente
cp .env.example .env

# Backend
cd cal/backend
npm install
npm run start:dev

# Frontend (en otra terminal)
cd cal/frontend
npm install
npm run dev
```

## Comandos útiles

```bash
make dev          # Levanta todo con docker-compose
make dev-build    # Levanta reconstruyendo imágenes
make test         # Corre todos los tests (backend unit + e2e + frontend)
make lint         # Lint de backend y frontend
make build        # Construye imágenes Docker
make install      # Instala dependencias npm en backend y frontend
make clean        # Elimina contenedores, volúmenes y node_modules
```

## Estructura del proyecto

```
cal/
├── backend/              # NestJS + TypeORM
│   └── src/
│       ├── core/         # Módulos transversales (salud, config)
│       ├── seguridad/    # Auth, JWT, RBAC, AuditLog (Fase 1)
│       ├── modulo-horarios/    # Motor IA de horarios (Fases 3-4)
│       ├── modulo-evaluacion/  # KDD y evaluación docente (Fases 5-6)
│       └── compartido/   # Entidades comunes
└── frontend/             # React 18 + Vite + TailwindCSS
    └── src/
        ├── modulos/horarios/
        ├── modulos/evaluacion/
        ├── seguridad/
        └── compartido/
```

## Fases de desarrollo

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Bootstrap | ✅ Completada |
| 1 | Seguridad (Auth/RBAC/AuditLog) | ⏳ Pendiente |
| 2 | Compartido + datos maestros | ⏳ Pendiente |
| 3 | Módulo 1: motor IA (sin Gemini) | ⏳ Pendiente |
| 4 | Módulo 1: integración Gemini | ⏳ Pendiente |
| 5 | Módulo 2: formularios y recolección | ⏳ Pendiente |
| 6 | Módulo 2: KDD + alertas + dashboard | ⏳ Pendiente |
| 7 | Frontend completo | ⏳ Pendiente |
| 8 | Hardening | ⏳ Pendiente |
