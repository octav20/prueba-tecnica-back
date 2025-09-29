Prueba Técnica: Gestión de Empleados y Proyectos (Backend)


🛠️ Configuración e Instalación
1. Requerimientos

Asegúrate de tener instalado:

    Node.js (v18+ recomendado)

    SQL Server (o SQL Server Express/Developer Edition)

2. Instalación de Dependencias

Navega a la carpeta /backend e instala las dependencias:

npm install

3. Configuración de Variables de Entorno

Crea un archivo llamado .env en la carpeta /backend y añade las siguientes variables, reemplazando los valores placeholders con tus credenciales de SQL Server:

# Configuración del Servidor
PORT=3001
JWT_SECRET=TU_SECRETO_SEGURO_PARA_JWT

# Configuración de Conexión a SQL Server (Para Sequelize/Tedious)
DB_SERVER=localhost
DB_USER=tu_usuario_sql
DB_PASSWORD=tu_contraseña_sql
DB_NAME=SistemaGestion
DB_DIALECT=mssql

🔑 Configuración de la Base de Datos (SQL Server)

Para recrear el esquema de la base de datos, sigue los siguientes pasos utilizando la herramienta de tu preferencia (SSMS o Azure Data Studio):

    Ejecutar el Script:

        Abre el archivo database_schema.sql ubicado en la raíz del proyecto.

        Conéctate a tu instancia de SQL Server (usando las mismas credenciales definidas en el .env).

        Ejecuta el script completo.

    Verificación del Esquema:

        El script creará la base de datos SistemaGestion y las tablas Empleados, Proyectos, Usuarios y ProyectoEmpleados.

        Usuario Administrador: El script incluye un usuario de prueba en la tabla Usuarios:

            NombreUsuario: admin

            ContraseñaHash: admin

🚀 Ejecución del Proyecto

Para iniciar el servidor de Express en modo desarrollo (con nodemon):

npm run dev
# Servidor corriendo en http://localhost:3001

