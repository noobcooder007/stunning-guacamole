# CLAUDE.md — stunning-guacamole

Sistema backend para la administración de donativos eclesiásticos.
Consulta [ARCHITECTURE.md](ARCHITECTURE.md) para el diagrama completo de módulos, flujo de datos y decisiones técnicas.

---

## Stack

- **Runtime / Lenguaje**: Node.js · TypeScript 5 (strict)
- **Framework**: NestJS 10 · CQRS (`@nestjs/cqrs`)
- **Persistencia**: TypeORM 0.3 · PostgreSQL 14
- **Auth**: Passport.js (JWT) · bcrypt · cookies httpOnly
- **Tests**: Jest 29 · class-validator (DTOs) · Supertest (e2e)

---

## Comandos de desarrollo

```bash
# Levantar base de datos
docker compose up -d

# Modo desarrollo con hot-reload
npm run start:dev

# Lint + formato
npm run lint
npm run format

# Tests unitarios
npm test
npm run test:watch     # modo observación
npm run test:cov       # con cobertura

# Tests e2e
npm run test:e2e

# Compilación
npm run build
```

---

## Estructura del proyecto

```
src/
├── shared/        # Módulo transversal: hashers, cifrado, PDF, filtros, interceptors
├── database/      # TypeORM config, UnitOfWork, BaseRepository, tokens DI
├── auth/          # Autenticación JWT, RBAC (roles + permisos), usuarios, sesiones
├── community/     # Iglesias, colectores, bienhechores, asignaciones
└── donation/      # Promesas de donación, recibos, folios, generación PDF
```

Cada módulo sigue **tres capas**:

```
domain/          → Aggregates, Value Objects, interfaces de repositorio
application/     → Commands, Queries, Handlers, DTOs, servicios de aplicación
infrastructure/  → Controladores REST, esquemas TypeORM, adapters, mappers
```

### Convenciones por capa

| Artefacto | Capa | Ejemplo |
|---|---|---|
| `*.aggregate.ts` | domain | `role.aggregate.ts` |
| `*.entity.ts` | domain | `permission.entity.ts` |
| `*.vo.ts` | domain | `money.vo.ts` |
| `*.command.ts` | application | `create-permission.command.ts` |
| `*.query.ts` | application | `get-all-roles.query.ts` |
| `*.handler.ts` | application | `assign-permissions-to-role.handler.ts` |
| `*.dto.ts` | application | `create-permission.dto.ts` |
| `*.controller.ts` | infrastructure | `permissions.controller.ts` |
| `*.schema.ts` | infrastructure | `permission.schema.ts` |
| `*.mapper.ts` | infrastructure | `permission.mapper.ts` |
| `*.repository.ts` | infrastructure | `typeorm-permission-repository.ts` |

---

## Flujo de trabajo Git

### Ramas principales

| Rama | Propósito |
|---|---|
| `main` | Producción — solo recibe merges desde `develop` vía PR |
| `develop` | Integración — base para todas las ramas de feature |

### Crear una nueva feature

```bash
# 1. Siempre partir desde develop actualizado
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feat/nombre-descriptivo

# 3. Desarrollar y hacer commits atómicos
git add src/auth/...
git commit -m "feat: añadir endpoint de asignación de permisos a roles"

# 4. Mantener la rama al día con develop
git fetch origin
git rebase origin/develop

# 5. Abrir PR hacia develop cuando esté lista
```

### Prefijos de ramas

| Prefijo | Uso |
|---|---|
| `feat/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `refactor/` | Refactorización sin cambio de comportamiento |
| `test/` | Añadir o corregir tests |
| `chore/` | Tareas de mantenimiento (deps, config, CI) |

### Formato de commits (Conventional Commits)

```
<tipo>: <descripción en imperativo, en español>

# Ejemplos
feat: añadir handler de creación de permisos
fix: corregir validación de permisos inactivos en asignación de roles
refactor: extraer buildPermissionMap al seed handler
test: añadir specs para CreatePermissionDto
chore: actualizar dependencias de NestJS a 10.4
```

Tipos válidos: `feat` · `fix` · `refactor` · `test` · `chore` · `docs` · `perf`

---

## Tests unitarios

### Ubicación

Los tests se colocan **junto al archivo que prueban**, con el sufijo `.spec.ts`:

```
src/auth/application/dto/create-permission.dto.ts
src/auth/application/dto/create-permission.dto.spec.ts
```

### Estructura estándar de un spec

```typescript
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePermissionDto } from './create-permission.dto';

describe('CreatePermissionDto', () => {
  it('debería validar con datos correctos', async () => {
    const dto = plainToInstance(CreatePermissionDto, {
      name: 'view:church',
      description: 'Ver iglesia',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería rechazar un nombre sin formato action:resource', async () => {
    const dto = plainToInstance(CreatePermissionDto, {
      name: 'nombre-invalido',
      description: 'Descripción',
    });
    const errors = await validate(dto);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('matches');
  });
});
```

### Reglas de los tests unitarios

- **Nunca impactar la base de datos.** Todos los repositorios, `UnitOfWork`, `DataSource` y servicios de infraestructura se mockean con `jest.fn()`. Los tests unitarios son completamente en memoria.
- Los DTOs con decoradores `@Type()` de `class-transformer` requieren `import 'reflect-metadata'` al inicio del spec.

### Qué testear por capa

| Capa | Qué testear | Cómo |
|---|---|---|
| **DTOs** | Validaciones de `class-validator` | `plainToInstance` + `validate()` |
| **Value Objects** | `create()` lanza con datos inválidos, `equals()`, `unpack()` | Instanciación directa |
| **Aggregates / Entidades** | Métodos de dominio (`deactivate`, `updatePermissions`, invariantes) | Instanciación con `recreate()` |
| **Handlers** | Lógica del caso de uso con repositorios mockeados | `jest.fn()` — nunca instanciar repositorios reales |

### Ejecutar un solo archivo

```bash
npx jest src/auth/application/dto/create-permission.dto.spec.ts
```

### Cobertura

Al finalizar una sesión de trabajo en tests, siempre ejecutar el reporte de cobertura completo:

```bash
npm run test:cov
```

Revisar las métricas de **Statements**, **Branches**, **Functions** y **Lines** por módulo.  
Identificar archivos con cobertura baja y añadir specs adicionales antes de hacer merge.

---

## Documentación

### Cuándo añadir comentarios en el código

Solo cuando el **por qué** no es obvio: una restricción oculta, un workaround a un bug externo, o una invariante de negocio que sorprendería a un lector futuro.

```typescript
// El superadministrador bypass todos los checks en PermissionsGuard;
// los permisos asignados aquí son solo para trazabilidad y auditoría.
const superAdmin = Role.create({ permissions: new Set(allPermissions) });
```

No documentar lo que ya explica el nombre de la función o variable.

### ARCHITECTURE.md

Actualizar [ARCHITECTURE.md](ARCHITECTURE.md) cuando:
- Se añade un nuevo módulo o capa
- Se introduce un nuevo endpoint (tabla de API REST)
- Cambia una decisión técnica relevante (sección *Decisiones Técnicas Clave*)
- Se modifica el modelo de dominio (sección *Modelo de Dominio*)

### Seguridad de datos

Los campos sensibles (calle, email, teléfono, RFC) se cifran en reposo con AES-256-CBC mediante transformers de TypeORM. Los datos de búsqueda usan blind indexes (SHA-256 + pepper). Al añadir nuevos campos con datos personales, aplicar el mismo patrón en el schema correspondiente.
