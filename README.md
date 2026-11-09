# Registro de Equipos Mineros

App fullstack para llevar el control de equipos mineros (camiones, excavadoras y perforadoras): horómetro, intervalos de mantenimiento e historial. El despliegue completo se hace con un solo comando, `./deploy.sh`.

| | URL |
|---|---|
| Frontend | https://mineria-equipos.vercel.app |
| API | https://mineria-equipos-api.onrender.com |
| Health | https://mineria-equipos-api.onrender.com/health |

El plan gratuito de Render duerme el servicio, así que la primera petición puede tardar hasta un minuto.

## Stack

- **Frontend:** React, Vite y TypeScript, en Vercel.
- **Backend:** Node.js, Express y Zod, en Render.
- **Base de datos:** PostgreSQL en Neon, con migraciones SQL propias.
- **Despliegue:** scripts Bash (`deploy.sh` + `scripts/`).
- **Calidad:** `node:test`, GitHub Actions y Docker Compose.

## Modelo y regla de negocio

Tres tablas: `equipment_types` (tipo e intervalo en horas), `equipment` (código único, tipo, horómetro y horómetro del último mantenimiento) y `maintenance_history`.

Un equipo requiere mantenimiento cuando:

```
horómetro - último_mantenimiento >= intervalo del tipo
```

Registrar un mantenimiento inserta en el historial y actualiza `last_maintenance_hours` en una sola transacción, lo que reinicia el ciclo. Intervalos sembrados: camión 500 h, excavadora 250 h, perforadora 300 h.

El backend está en capas (rutas, servicios, repositorios). La regla vive en `services/maintenance.js` como función pura, por eso se prueba sin base de datos.

## API

| Método | Ruta | |
|---|---|---|
| GET | `/health` | Estado del servicio y la BD (incluye el commit desplegado) |
| GET | `/equipment-types` | Tipos e intervalos |
| GET | `/equipment` | Lista paginada (`?page=&limit=`) |
| GET | `/equipment/:id` | Detalle |
| POST | `/equipment` | Crear |
| PUT | `/equipment/:id` | Editar |
| DELETE | `/equipment/:id` | Eliminar |
| POST | `/equipment/:id/maintenance` | Registrar mantenimiento |
| GET | `/equipment/:id/maintenance` | Historial |

Errores: `400` validación, `404` no existe, `409` código duplicado.

## Desarrollo local

Necesitas Node 22+.

**Con Docker** (Postgres + API, migraciones incluidas):

```bash
docker compose up --build
```

**Sin Docker**, con tu propia base (por ejemplo Neon):

```bash
cp .env.example .env     # completa DATABASE_URL
cd backend
npm install
npm run migrate
npm start
```

Frontend, en otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La API queda en `localhost:3000` y la app en `localhost:5173`.

## Pruebas y CI

```bash
cd backend && npm test
```

Seis pruebas sobre la regla de mantenimiento: borde exacto del intervalo, reinicio del ciclo y estado resultante. GitHub Actions corre las pruebas y el build del frontend en cada push y pull request.

## Despliegue

```bash
./deploy.sh
```

Se ejecuta desde la raíz con Bash (Git Bash en Windows). Necesita `git`, `node`, `npm`, `curl` y la CLI de Vercel, además del `.env` completo (ver `.env.example`).

El script corre seis pasos y se detiene en el primero que falle:

1. Verifica herramientas, variables de entorno y que el repo no tenga cambios sin commit ni sin push (Render despliega desde GitHub).
2. Instala dependencias y compila. Un error de TypeScript aborta antes de publicar.
3. Aplica las migraciones pendientes sobre la base de producción.
4. Dispara el deploy del backend con el hook de Render.
5. Publica el frontend con `vercel deploy --prod`.
6. Consulta `/health` con reintentos hasta que el commit servido coincida con `HEAD`, y comprueba que el frontend responde.

Ante cualquier fallo imprime el paso y el motivo, y sale con código distinto de 0. Es idempotente: las migraciones se registran en `schema_migrations`, así que ejecutarlo varias veces no rompe nada. Lo probé forzando tres fallos (variable faltante, árbol sucio y hook inválido), y en los tres termina con código 1.

### Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `PORT`, `FRONTEND_URL` | Puerto de la API y origen permitido por CORS |
| `VITE_API_URL` | URL de la API para el frontend |
| `RENDER_DEPLOY_HOOK` | Hook de despliegue del servicio en Render |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | CLI de Vercel |
| `BACKEND_URL`, `FRONTEND_PUBLIC_URL` | URLs públicas para el health check |

En producción, `DATABASE_URL` y `FRONTEND_URL` se configuran en Render, y `VITE_API_URL` en Vercel. El `.env` no se versiona.

## Uso de IA

Usé Claude (Anthropic) como asistente para planear el trabajo, generar el código base del backend, el frontend, los scripts, las pruebas, el workflow de CI y el Docker Compose, y para depurar errores. Trabajé en Antigravity IDE. Revisé y probé cada parte (migraciones, endpoints y errores, pruebas, Docker y el script con fallos provocados) y puedo explicar cualquier archivo del repo.