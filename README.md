# Stunning Guacamole

1. Clonar el repositorio.
2. Instalar dependencias usando pnpm, se recomienda este manejador de paquetes ya que el repositorio fue creado de esta manera.

````
pnpm install
````

3. Clonar el archivo ``.env.template`` y renombrarlo como ``.env.development.local``.
4. Asignar el valor a las variables de entorno en el archivo ``.env.development.local``. Estás se tomarán para el contenedor de Docker por igual.
5. Levantar la base de datos ejecutando el siguiente comando en la terminal.

````
docker compose up -d
````

6. Levantar el aplicativo ejecutando el siguiente comando en la terminal.

````
pnpm run start:dev
````

*Sigue las instrucciones en el orden que se indica para evitar algún error en la configuración del ambiente de desarrollo.

---

## Despliegue

La app se construye como imagen Docker (`Dockerfile` multi-stage, `node:20-bookworm-slim`) y se despliega en un VPS vía [Dokploy](https://dokploy.com/) (Application basada en Dockerfile + Database PostgreSQL gestionada por Dokploy).

1. En Dokploy, crear una **Database → PostgreSQL** y anotar sus credenciales/host interno.
2. Crear una **Application** apuntando al repo, rama `main`, build type `Dockerfile`.
3. Configurar las variables de entorno (ver `.env.template`), marcando como *secret* `DB_PASSWORD`, `ENCRYPTION_KEY`, `PEPPER`, `JWT_SECRET` y `SETUP_KEY`. `APP_URL` debe apuntar al loopback interno del contenedor, p. ej. `http://localhost:<PORT>` — la app lo usa para releer sus propias imágenes de perfil al generar PDFs.
4. Montar un volumen persistente en `images/` (o `images/profile-pictures`) para que las fotos de perfil sobrevivan a cada redeploy.
5. Configurar el health check HTTP de la Application contra `/api/health`.
6. Tras el primer build, correr `pnpm run migration:run:prod` (vía la terminal de Dokploy o como comando post-build) antes de exponer tráfico — corre las migraciones sobre el `dist/` compilado, sin depender de `ts-node`.
