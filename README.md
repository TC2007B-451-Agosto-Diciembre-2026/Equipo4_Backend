# Equipo4_Backend

Este es el backend del proyecto 0Fraud Stay. Está desarrollado con NestJS y se encarga de manejar la lógica del servidor, la autenticación de usuarios y la conexión con la base de datos MySQL.
Actualmente incluye el registro, inicio de sesión y renovación de sesión mediante JWT, además de las operaciones de usuarios.

Para correr el proyecto se necesita:
- Node.js
- MySQL Server
- npm (se instala junto con Node.js)

También se necesita tener creada la base de datos fraud2 con el archivo: _db/schema.sql_

## ¿Cómo correr el programa?

Primero instala las dependencias:

_npm install_

Después asegúrate de que MySQL esté encendido y que la base de datos esté configurada.

Desde la carpeta principal del proyecto, ejecuta:

_mysql -u root -p < db/schema.sql_

Para iniciar el backend en modo desarrollo:

_npm run start:dev_

El servidor estará disponible en:

_http://localhost:3000_

## ¿Cómo se usa?

El backend puede probarse utilizando herramientas como Postman.

**Registrar un usuario**

POST /auth/register

Body:

{
  "email": "usuario@example.com",
  "password": "12345678",
  "nombre": "Usuario"
}

**Iniciar sesión**

POST /auth/login

Body:

{
  "email": "usuario@example.com",
  "password": "12345678"
}

_El login devuelve un accessToken y un refreshToken_

**Renovar el token**

POST /auth/refresh

Body:

{
  "refreshToken": "tu_refresh_token"
}

## Estructura

El código principal se encuentra dentro de src/

**auth/:** contiene la autenticación, JWT, guards, DTOs y el acceso a usuarios utilizado por el login.

**usuarios/:** contiene el CRUD de usuarios, incluyendo controller, service, repository, DTOs y entity.

**database/:** contiene la configuración de la conexión con MySQL.

**common/:** contiene funciones compartidas, como el manejo de contraseñas.

**app.module.ts:** módulo principal que conecta los diferentes módulos del backend.

**main.ts:** punto de entrada de la aplicación.

**db/schema.sql:** base de datos y su estructura
