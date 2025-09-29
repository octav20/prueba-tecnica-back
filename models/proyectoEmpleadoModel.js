const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');

// Esta tabla no tiene un ID primario propio; usa las FKs como PKs compuestas.
const ProyectoEmpleado = sequelize.define('ProyectoEmpleado', {
    ID_Proyecto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'ID_Proyecto'
    },
    ID_Empleado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'ID_Empleado'
    },
    FechaAsignacion: {
        // Usamos DATETIME en lugar de DATE para incluir la hora
        type: DataTypes.DATE,
        allowNull: false,
        // *** CAMBIO CLAVE PARA EVITAR EL ERROR DE CONVERSIÓN ***
        // Le dice a Sequelize que use la función de fecha/hora nativa de SQL Server
           defaultValue: Sequelize.fn('GETDATE') 
    }
}, {
    tableName: 'ProyectoEmpleados',
    timestamps: false
});

module.exports = ProyectoEmpleado;
