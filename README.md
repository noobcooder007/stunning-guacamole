# Stunning Guacamole

1. Clonar el repositorio.
2. Instalar dependencias usando pnpm, se recomienda este manejador de paquetes ya que el repositorio fue creado de esta manera.

````
yarn install
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
