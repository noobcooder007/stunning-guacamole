# Arquitectura de Stunning Guacamole

Sistema backend para la administración de donativos eclesiásticos (iglesias, colectores, bienhechores, promesas de donación, recibos y periodos de cobranza).

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Lenguaje | TypeScript 5.1+ (strict mode) |
| Framework | NestJS 10 |
| Patrón | DDD + CQRS + Event-Driven |
| ORM | TypeORM 0.3.x |
| BD | PostgreSQL 14.3 |
| Auth | Passport.js (JWT), bcrypt, cookies |
| PDF | pdfmake 0.3.x (worker thread) |
| Cifrado | AES-256-CBC, SHA-256 |
| Tests | Jest + Supertest |
| Contenedores | Docker Compose (PostgreSQL) |

---

## Estructura de Directorios

```
src/
├── main.ts                     # Punto de entrada: bootstrap, pipes globales, CORS, filtros
├── app.module.ts               # Módulo raíz: importa Config, Database, Auth, Community, Donation
│
├── shared/                     # Módulo transversal (servicios compartidos)
│   ├── domain/                 #   DTOs (Result<T>, Paginated<T>), excepciones, guards, ValueObject
│   ├── application/            #   Handlers base (Command, Query), PDF service (worker)
│   └── infrastructure/         #   Filtros, interceptors (Result, Audit, RolesSerializer), workers, audit
│
├── database/                   # Infraestructura de BD
│   ├── base.repository.ts      #   Repositorio abstracto transaccional (AsyncLocalStorage)
│   ├── unit-of-work.ts         #   UnitOfWork: ejecuta operaciones en transacción atómica
│   └── persistence/            #   Registry de tokens DI para todos los repositorios
│
├── auth/                       # Módulo de autenticación y autorización
│   ├── domain/                 #   User, Role, Session (aggregates); Permission (entity); VO; JWT strategy
│   ├── application/            #   Comandos (login, logout, refresh, seed, create); handlers; repos interfaces
│   └── infrastructure/         #   Controladores, decoradores, guards, persistencia TypeORM
│
├── community/                  # Módulo de comunidad (iglesias, colectores, bienhechores)
│   ├── domain/                 #   Church, Collector, Beneficient, Assignation (aggregates); VO; servicios
│   ├── application/            #   Comandos y queries CRUD; handlers; eventos de dominio
│   └── infrastructure/         #   Controladores, query services, persistencia TypeORM
│
└── donation/                   # Módulo de donaciones y recibos
    ├── domain/                 #   PromiseDonation, Receipt, CollectionPeriod (aggregates)
    │                           #   CollectorSettlement (entity); Money, ReceiptFolio (VO)
    ├── application/            #   Comandos y queries; handlers; templates PDF
    └── infrastructure/         #   Controladores, query services, persistencia TypeORM
```

---

## Patrón Arquitectónico: DDD + CQRS

Cada módulo se organiza en tres capas:

```
┌──────────────────────────────────────────────────┐
│                   Módulo                          │
│                                                    │
│  ┌─────────────┐   ┌───────────────┐              │
│  │   domain/   │──▶│ application/  │              │
│  │  (reglas de │   │  (casos de    │              │
│  │   negocio)  │   │   uso - CQRS) │              │
│  └──────┬──────┘   └───────┬───────┘              │
│         │                  │                       │
│         ▼                  ▼                       │
│  ┌─────────────────────────────────────┐           │
│  │        infrastructure/              │           │
│  │  (controladores, persistencia, etc) │           │
│  └─────────────────────────────────────┘           │
└────────────────────────────────────────────────────┘
```

### Capa de Dominio (`domain/`)
- **AggregateRoots**: Entidades raíz que extienden `AggregateRoot` de `@nestjs/cqrs`. Aplican eventos de dominio.
  - `User`, `Role`, `Session` (auth)
  - `Church`, `Collector`, `Beneficient`, `Assignation` (community)
  - `PromiseDonation`, `Receipt`, `CollectionPeriod` (donation)
- **Entidades de dominio**: Sin identidad de aggregate, creadas con `create()`.
  - `CollectorSettlement` (donation)
- **Value Objects**: Inmutables, con igualdad estructural (`equals()`, `unpack()`, `toJSON()`).
  - Ej: `Address`, `Numeration`, `Money`, `ReceiptFolio`, `RefreshTokenHash`
- **Interfaces de repositorio**: Contratos abstractos para persistencia.
- **Servicios de dominio**: Lógica que no encaja en una sola entidad (ej: `AssignamentImplService`).

### Capa de Aplicación (`application/`)
- **Comandos**: Mutaciones de estado → `CommandBus.execute(command)`
- **Queries**: Lecturas → `QueryBus.execute(query)`
- **Handlers**: Procesan comandos/queries, orquestan aggregates, invocan repositorios.
- **Eventos**: `BeneficientDeactivatedEvent`, `CollectorDeactivatedEvent` → habilitan consistencia eventual.
- **DTOs de entrada/salida**: `class-validator` + `class-transformer`.
- **Templates PDF**: Funciones puras que reciben datos y retornan `TDocumentDefinitions` de pdfmake.

### Capa de Infraestructura (`infrastructure/`)
- **Controladores REST**: Reciben HTTP, delegan en Command/QueryBus.
- **Persistencia TypeORM**: Esquemas (table mappings), adapters (implementaciones de repositorios), mappers (dominio ↔ persistencia).
- **Query Services**: Lecturas complejas con filtros dinámicos y paginación.
- **Decoradores/Guards**: `@Auth`, `@Permissions`, `@GetUser`, `PermissionsGuard`, `SetupGuard`.

---

## Flujo de Datos

### Comando (mutación)
```
HTTP → Controlador → CommandBus → CommandHandler
  → AggregateRoot (validación + eventos)
    → Repository.save()
      → Mapper.toPersistence() → TypeORM → PostgreSQL
```

### Consulta (lectura)
```
HTTP → Controlador → QueryBus → QueryHandler
  → QueryService (filtros + paginación)
    → TypeORM QueryBuilder → Mapper.toResponse()
      → Paginated<T>
```

### Evento (consistencia eventual)
```
Aggregate.apply(event) → EventBus
  → EventsHandler → operaciones en cascada
```

### Generación de Recibos (flujo complejo)
```
POST /api/receipts/generate/recurring
  → GenerateRecurringReceiptsHandler
    → Obtiene periodo abierto actual (si existe)
    → Busca promesas vigentes con colectores activos
    → UnitOfWork.runInTransaction()
      → Por cada promesa:
        1. Verifica que no exista recibo del mes
        2. ReceiptFolioProvider.generateNext() → folio "MAY2026-COL-R-0001"
        3. Receipt.createRecurring(…, collectionPeriodId) → aggregate
        4. promise.updateLastDonation() + updateNextDonation()
        5. promiseDonationRepository.save()
        6. receiptRepository.save()
```

### Ciclo de Vida de un Periodo de Cobranza
```
POST /api/periods/open
  → OpenPeriodHandler
    → Verifica que no haya periodo OPEN (índice único parcial en BD)
    → CollectionPeriod.open(month, year, userId) → status = OPEN
    → save()

  [Recibos generados/pagados se enlazan al periodo abierto]

POST /api/periods/close
  → ClosePeriodHandler
    → Busca periodo OPEN (404 si no existe)
    → Obtiene recibos PAID del periodo
    → Agrupa por colector, calcula commissionAmount por cada uno
    → period.close(userId, totalCollected, totalCommissions)
    → UnitOfWork: guarda periodo + CollectorSettlements en transacción
    → Retorna totales + detalle de liquidaciones

GET /api/periods/:id/settlement-letters  → PDF carta de liquidación por colector
GET /api/periods/:id/delivery-letters    → PDF carta de entrega de recibos
  (requiere que todos los recibos del periodo tengan printCount ≥ 1)
```

---

## Módulos y sus Relaciones

```
┌───────────────┐    ┌──────────────────┐
│ ConfigModule  │    │  DatabaseModule  │
│ (global .env) │    │  (global, TypeORM│
└───────────────┘    │   + repos)       │
                     └────────┬─────────┘
                              │
┌───────────────┐    ┌───────┴──────────┐    ┌──────────────────┐
│  SharedModule │◄───│    AppModule      │───▶│   AuthModule     │
│ (hashers,     │    │                   │    │ (JWT, roles,     │
│  encryption,  │    │                   │    │  sesiones)       │
│  PDF, audit)  │    │                   │    └────────┬─────────┘
└───────────────┘    └───────────────────┘             │
                              │                        │
                              ▼                        ▼
              ┌──────────────────────────┐  ┌──────────────────────┐
              │    CommunityModule        │  │    DonationModule    │
              │ (iglesias, colectores,    │  │ (promesas, recibos,  │
              │  bienhechores,            │  │  periodos, folios,   │
              │  asignaciones)            │  │  liquidaciones, PDF) │
              └──────────────────────────┘  └──────────────────────┘
```

| Módulo | Dependencias | Responsabilidad |
|---|---|---|
| **SharedModule** | -- | Servicios cross-cutting: hashers, cifrado, generación PDF, filtro global de excepciones, interceptors (Result, Audit, RolesSerializer), middlewares (traceId), audit logging |
| **DatabaseModule** | SharedModule | Conexión TypeORM, registro de esquemas y repositorios, UnitOfWork, contexto transaccional (AsyncLocalStorage) |
| **AuthModule** | SharedModule, CqrsModule, PassportModule, JwtModule | Autenticación (JWT + refresh tokens en cookie), registro de usuarios, RBAC con permisos granulares, seed de admin inicial |
| **CommunityModule** | AuthModule, SharedModule, CqrsModule, TypeOrmModule | CRUD de iglesias, colectores, bienhechores; lógica de asignación colector↔bienhechor; manejo de activos/inactivos |
| **DonationModule** | AuthModule, SharedModule, CqrsModule, TypeOrmModule | Promesas de donación, generación de recibos (recurrentes y especiales), periodos de cobranza, liquidaciones de colectores, eficiencia de cobranza, impresión PDF |

---

## Modelo de Dominio (Entidades y Relaciones)

```
Iglesia (1) ──────────< (N) Bienhechor
                            │
Colector (1) ──────────< (N) Asignación (N) >── (1) Bienhechor
    │
    │
  Usuario ── (N) Sesión

PromesaDonación (1) ── (1) Bienhechor
       │
       │
   Recibo (N) ── (1) PromesaDonación
       │          ├── (1) Bienhechor
       │          ├── (1) Colector
       │          └── (1) PeriodoCobranza (nullable)
       │
PeriodoCobranza (1) ──< (N) LiquidaciónColector (N) >── (1) Colector
```

### Ciclo de vida del Recibo
```
PENDING → PAID      (markAsPaid: enlaza al periodo abierto actual)
PENDING → CANCELLED (cancel: requiere motivo y userId)
```

### Ciclo de vida del Periodo de Cobranza
```
OPEN → CLOSED  (close: calcula totales y genera CollectorSettlements)
```
Solo puede existir un periodo `OPEN` a la vez (índice único parcial en PostgreSQL: `WHERE status = 'OPEN'`).

---

## API REST (Endpoints)

### Auth (`/api/auth`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/login` | No | Inicio de sesión (setea cookie httpOnly `refresh-token`) |
| POST | `/register` | `add:user` | Registrar nuevo usuario |
| POST | `/refresh` | No | Refrescar sesión vía cookie; rota el refresh token |
| POST | `/logout` | No | Cerrar sesión (limpia cookie) |

### Seed (`/api/seed`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/admin` | SetupGuard | Crear administrador inicial |

### Iglesia (`/api/church`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/` | `add:church` |
| GET | `/` | `list:church` |
| GET | `/:id` | `view:church` |
| PATCH | `/:id/identity` | `edit:church` |
| PATCH | `/:id/address` | `edit:church` |
| PATCH | `/:id/priest` | `edit:church` |
| PATCH | `/:id/auxiliar` | `edit:church` |
| PATCH | `/:id/phone` | `edit:church` |

### Colector (`/api/collector`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/` | `add:collector` |
| GET | `/` | `view:collector` |
| GET | `/:id` | `view:collector` |
| POST | `/:id/deactivate` | `edit:collector` |
| POST | `/:id/reactivate` | `edit:collector` |

### Bienhechor (`/api/beneficient`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/` | `add:beneficient` |
| GET | `/` | `view:beneficient` |
| GET | `/:id` | `view:beneficient` |
| POST | `/deactivate` | `edit:beneficient` |

### Asignación (`/api/assignment`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/` | `edit:collector` |
| POST | `/reassign` | `edit:collector` |
| POST | `/deactivate` | `edit:collector` |
| GET | `/actives` | `view:collector` |
| GET | `/orphans` | `view:collector` |

### Promesas de Donación (`/api/promises`)
| Método | Ruta | Auth |
|---|---|---|
| POST | `/` | `add:promise-donation` |
| GET | `/` | `view:promise-donation` |
| GET | `/with-beneficients` | `view:promise-donation` |
| GET | `/:id` | `view:promise-donation` |
| PATCH | `/:id/deactivate` | `edit:promise-donation` |

### Recibos (`/api/receipts`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/generate/recurring` | `add:invoice` | Generar recibos recurrentes del mes (enlaza al periodo abierto) |
| POST | `/generate/special` | `add:invoice` | Generar recibo especial (devuelve PDF) |
| GET | `/` | `view:invoice` | Listar recibos (paginado, filtrable) |
| GET | `/print` | `view:invoice` | Imprimir recibos por colector/mes/año (PDF); incrementa printCount |
| GET | `/print/collector-letter` | `view:invoice` | Carta de entrega de recibos impresos (PDF); requiere printCount ≥ 1 |
| POST | `/cancel` | `edit:invoice` | Cancelar recibo con motivo |
| POST | `/mark-as-paid` | `edit:invoice` | Marcar recibos como pagados; enlaza al periodo abierto actual |
| GET | `/collectors/:id/efficiency` | `view:invoice` | Eficiencia de cobranza por periodo, año e histórico (JSON) |
| GET | `/collectors/:id/efficiency/export` | `view:invoice` | Eficiencia de cobranza (PDF) |

### Periodos de Cobranza (`/api/periods`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/open` | `edit:invoice` | Abrir nuevo periodo (409 si ya existe uno OPEN) |
| POST | `/close` | `edit:invoice` | Cerrar periodo; calcula totales y liquidaciones por colector |
| GET | `/current` | `view:invoice` | Obtener periodo abierto actual (404 si no existe) |
| GET | `/:periodId/settlements` | `view:invoice` | Listar liquidaciones del periodo |
| GET | `/:periodId/settlement-letters` | `view:invoice` | Cartas de liquidación por colector (PDF) |
| GET | `/:periodId/delivery-letters` | `view:invoice` | Cartas de entrega de recibos por colector (PDF) |

### Permisos (`/api/permissions`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | `view:permission` | Listar todos los permisos |
| POST | `/` | `add:permission` | Crear permiso personalizado |
| PATCH | `/:id` | `edit:permission` | Actualizar descripción |
| POST | `/:id/deactivate` | `delete:permission` | Desactivar permiso |

### Roles (`/api/roles`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | `view:role` | Listar todos los roles con sus permisos |
| GET | `/:id` | `view:role` | Obtener rol por ID |
| PUT | `/:id/permissions` | `edit:role` | Reemplazar el conjunto de permisos de un rol |

---

## Audit Logging

Cada petición HTTP queda registrada automáticamente en la tabla `audit_logs` vía `AuditInterceptor` (global, registrado como `APP_INTERCEPTOR`).

| Campo | Descripción |
|---|---|
| `traceId` | UUID de la petición (correlaciona con logs del servidor) |
| `userId` | ID del usuario autenticado (nullable para rutas públicas) |
| `operation` | `METHOD /ruta` (ej: `POST /api/receipts/generate/recurring`) |
| `status` | `SUCCESS` o `FAILURE` |
| `errorMessage` | Mensaje de error si aplica |
| `durationMs` | Tiempo de ejecución en milisegundos |
| `ip` | IP del cliente |
| `userAgent` | User-Agent del cliente |

El `AuditService` usa un `QueryRunner` dedicado por entrada, independiente de la transacción de negocio — los registros de auditoría se persisten **aunque la transacción principal haga rollback**.

---

## Seguridad y Protección de Datos

| Mecanismo | Descripción |
|---|---|
| **bcrypt** | Contraseñas con 10 rondas de sal |
| **JWT** | Access token (15 min, en header) + refresh token (30 días, cookie httpOnly) |
| **Refresh Token** | Almacenado como hash bcrypt en BD; rotado en cada uso |
| **Blind Index** | Datos personales hasheados con SHA-256 + pepper para deduplicación sin exponer datos |
| **Cifrado AES-256-CBC** | Campos sensibles (calle, email, teléfono, RFC) cifrados en reposo mediante transformers de TypeORM |
| **Cadena de Validación** | Cada recibo tiene un hash SHA-256 (`id\|folio\|monto\|beneficientId`) para integridad |
| **RBAC** | Control de acceso basado en roles con permisos granulares (`PermissionNames`). El rol `superadministrator` bypass todos los checks |
| **SetupGuard** | Protege el seed inicial con header `x-setup-key` |

---

## Interceptors Globales (orden de ejecución)

```
Request:  AuditInterceptor → RolesSerializerInterceptor → ResultInterceptor → Handler
Response: Handler → ResultInterceptor → RolesSerializerInterceptor → AuditInterceptor
```

| Interceptor | Registro | Función |
|---|---|---|
| `AuditInterceptor` | `APP_INTERCEPTOR` (módulo) | Persiste log de auditoría; re-lanza errores |
| `RolesSerializerInterceptor` | `useGlobalInterceptors` | Serializa respuesta con `instanceToPlain` aplicando `@Expose/@Exclude` por rol |
| `ResultInterceptor` | `useGlobalInterceptors` | Envuelve `Result<T>` en `{ statusCode, data, timestamp }`; lanza `DomainException` si `!isSuccess` |

**Nota**: Los controladores que usan `@Res()` para streaming PDF **no deben retornar** el objeto Express Response (`return res.pipe(...)`) — deben llamarlo sin `return` para que los interceptores reciban `undefined` y no intenten serializarlo.

---

## Transacciones y Trazabilidad

- **UnitOfWork**: Ejecuta operaciones en transacciones atómicas usando `AsyncLocalStorage` para compartir el `EntityManager` en toda la cadena de llamadas.
- **TraceId**: Cada request obtiene un UUID único propagado via `AsyncLocalStorage`, incluido en logs y respuestas de error.
- **LoggerMiddleware**: Inicializa el contexto de trazabilidad al inicio de cada request.

---

## PDF Generation

La generación de PDF se delega a un **worker thread** (`pdf.worker.ts`) para no bloquear el event loop. Usa `pdfmake 0.3.x` con layouts personalizados (`letterTable`, `noPadding`).

### Templates disponibles

| Template | Descripción |
|---|---|
| `receipt.template.ts` | Recibos de donación con foto de colector, código QR y enmascaramiento de datos |
| `collector-letter.template.ts` | Carta de entrega de recibos al colector (requiere printCount ≥ 1) |
| `settlement-letter.template.ts` | Carta de liquidación al colector con desglose de comisiones |
| `collector-efficiency.template.ts` | Reporte de eficiencia de cobranza: histórico, por año, por periodo |

---

## Decisiones Técnicas Clave

1. **DDD + CQRS** sobre CRUD tradicional porque el dominio tiene reglas de negocio complejas (asignaciones, recurrencias, validación de recibos, periodos de cobranza).
2. **Worker thread para PDF** porque la generación con pdfmake es cara y bloqueante.
3. **AsyncLocalStorage** para transacciones y traceId en vez de pasar contexto explícitamente — reduce acoplamiento.
4. **Result<T> monad** en vez de excepciones para errores de negocio — permite manejo explícito y tipado en handlers y controladores.
5. **Refresh tokens en cookie httpOnly** vs. localStorage — previene XSS. El `refreshToken` nunca aparece en el body de respuesta (`@Exclude()`); solo viaja como cookie.
6. **Blind indexes + cifrado AES** para datos personales — cumple con principios de privacidad por diseño.
7. **Índice único parcial PostgreSQL** para periodo OPEN (`WHERE status = 'OPEN'`) — garantiza a nivel de BD que solo existe un periodo abierto a la vez.
8. **QueryRunner dedicado para auditoría** — los logs de auditoría sobreviven rollbacks de la transacción principal.
9. **TypeORM con `synchronize: true`** en desarrollo — agiliza iteraciones; en producción se migraría a migraciones controladas.
