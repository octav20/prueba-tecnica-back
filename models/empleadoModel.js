const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Empleado = sequelize.define('Empleado', {
    ID_Empleado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID_Empleado'
    },
    Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
         field: 'Nombre'
    },
    ApellidoPaterno: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ApellidoMaterno: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    FechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    FechaAlta: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    Sueldo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true 
    },
    Estatus: {
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
    }
}, {
    tableName: 'Empleados', 
    timestamps: false 
});

module.exports = Empleado;