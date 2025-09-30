-- 1. CREAR LA BASE DE DATOS
--------------------------------------------------------------------------------
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SistemaGestion')
BEGIN
    CREATE DATABASE SistemaGestion;
END
GO

USE SistemaGestion;
GO

-- 2. CREAR TABLA: Empleados
--------------------------------------------------------------------------------
CREATE TABLE Empleados (
    ID_Empleado         INT IDENTITY(1,1) NOT NULL,
    Nombre              NVARCHAR(100) NOT NULL,
    ApellidoPaterno     NVARCHAR(100) NOT NULL,
    ApellidoMaterno     NVARCHAR(100) NOT NULL,
    FechaNacimiento     DATETIME NOT NULL,
    FechaAlta           DATETIME NOT NULL,
    Sueldo              DECIMAL(10, 2) NOT NULL,
    Correo              NVARCHAR(255) NOT NULL,
    Estatus             BIT NOT NULL DEFAULT 1, -- 1=Activo, 0=Inactivo

    -- CLAVE PRIMARIA
    CONSTRAINT PK_Empleados PRIMARY KEY CLUSTERED (ID_Empleado),

    -- RESTRICCIONES DE VALIDACIÓN
    -- Correo debe ser único (Requerimiento)
    CONSTRAINT UQ_Empleado_Correo UNIQUE (Correo),
    
    -- Sueldo debe ser positivo
    CONSTRAINT CHK_Empleado_Sueldo CHECK (Sueldo >= 0),
    
    -- Edad mínima de 18 años al momento del alta (Requerimiento)
    CONSTRAINT CHK_Empleado_EdadMinima CHECK (DATEDIFF(year, FechaNacimiento, FechaAlta) >= 18)
);
GO

-- 3. CREAR TABLA: Proyectos
--------------------------------------------------------------------------------
CREATE TABLE Proyectos (
    ID_Proyecto         INT IDENTITY(1,1) NOT NULL,
    NombreProyecto      NVARCHAR(200) NOT NULL,
    FechaInicio         DATETIME NOT NULL,
    FechaFin            DATETIME NOT NULL,
    Estatus             BIT NOT NULL DEFAULT 1, -- 1=Activo/En curso, 0=Finalizado/Inactivo
    
    -- CLAVE PRIMARIA
    CONSTRAINT PK_Proyectos PRIMARY KEY CLUSTERED (ID_Proyecto),

    -- RESTRICCIONES DE VALIDACIÓN
    -- La fecha de fin debe ser posterior o igual a la fecha de inicio
    CONSTRAINT CHK_Proyecto_Fechas CHECK (FechaFin >= FechaInicio)
);
GO

-- 4. CREAR TABLA: Usuarios (para Autenticación)
--------------------------------------------------------------------------------
CREATE TABLE Usuarios (
    ID_Usuario          INT IDENTITY(1,1) NOT NULL,
    NombreUsuario       NVARCHAR(50) NOT NULL,
    ContraseñaHash      NVARCHAR(255) NOT NULL, -- Almacena el hash de la contraseña (e.g., bcrypt)
    Rol                 NVARCHAR(50) NOT NULL DEFAULT 'Admin', 

    -- CLAVE PRIMARIA
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (ID_Usuario),

    -- RESTRICCIÓN DE UNICIDAD
    CONSTRAINT UQ_Usuario_Nombre UNIQUE (NombreUsuario)
);
GO

-- 5. CREAR TABLA: ProyectoEmpleados (Relación Muchos a Muchos)
--------------------------------------------------------------------------------
CREATE TABLE ProyectoEmpleados (
    ID_Proyecto         INT NOT NULL,
    ID_Empleado         INT NOT NULL,
    -- Usamos DATETIME2 para mayor precisión, y el valor por defecto GETDATE()
    FechaAsignacion     DATETIME2 NOT NULL DEFAULT GETDATE(), 

    -- CLAVE PRIMARIA COMPUESTA
    CONSTRAINT PK_ProyectoEmpleados PRIMARY KEY CLUSTERED (ID_Proyecto, ID_Empleado),

    -- CLAVE FORÁNEA a Proyectos
    CONSTRAINT FK_PE_Proyecto FOREIGN KEY (ID_Proyecto)
        REFERENCES Proyectos (ID_Proyecto)
        ON DELETE CASCADE, -- Si se elimina el proyecto, se eliminan las asignaciones

    -- CLAVE FORÁNEA a Empleados
    CONSTRAINT FK_PE_Empleado FOREIGN KEY (ID_Empleado)
        REFERENCES Empleados (ID_Empleado)
        ON DELETE CASCADE -- Si se elimina el empleado, se eliminan las asignaciones
);
GO

-- 6. DATOS INICIALES (Usuario Administrador)
--------------------------------------------------------------------------------
-- NOTA: Reemplazar 'admin_password_hash' por el hash real de bcrypt
INSERT INTO Usuarios (NombreUsuario, ContraseñaHash)
VALUES ('admin', '$2a$12$YfIIOgnJFrBybLtoEl3ZY.O6bvcgtYQZSylwK1gcrPc8sP4X/9Ukm'); 
GO
