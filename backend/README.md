# StoreAdmin Backend

API backend para StoreAdmin desarrollado en Go.

## Requisitos

- Go 1.26.4 o superior
- Docker y Docker Compose (para PostgreSQL)
- Make (opcional)

## Instalación

### 1. Instalar dependencias

```bash
make install-deps
# o manualmente:
go mod tidy
go get github.com/lib/pq
go get -u github.com/golang-migrate/migrate/v4/cmd/migrate
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` si necesitas cambiar las credenciales de la base de datos.

### 3. Iniciar PostgreSQL

```bash
make db-up
```

O manualmente con Docker:

```bash
docker-compose up -d postgres
```

### 4. Ejecutar migraciones

```bash
make migrate
```

O manualmente:

```bash
go run . migrate
```

## Comandos disponibles

### Base de datos

```bash
# Iniciar PostgreSQL
make db-up

# Detener PostgreSQL
make db-down

# Ejecutar migraciones
make migrate

# Revertir última migración
make migrate-down

# Revertir todas las migraciones
make migrate-reset
```

### Servidor

```bash
# Iniciar servidor
make server
```

## Estructura de migraciones

Las migraciones SQL se encuentran en el directorio `migrations/`:

- `000001_init_schema.up.sql` - Crea las tablas iniciales
- `000001_init_schema.down.sql` - Revierte los cambios

## Agregar nuevas migraciones

1. Crear archivos de migración:

```bash
touch migrations/000002_add_new_table.up.sql
touch migrations/000002_add_new_table.down.sql
```

2. Escribir el SQL para la migración
3. Ejecutar: `make migrate`

## Variables de entorno

```
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/base_datos?sslmode=disable
SERVER_PORT=8080
```
