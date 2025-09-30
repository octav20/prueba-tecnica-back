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
        allowNull: false,
      get() {
  const raw = this.getDataValue('FechaNacimiento');
  if (!raw) return null;

  const dateObj = raw instanceof Date ? raw : new Date(raw);
  return dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
  }
    },
    FechaAlta: {
        type: DataTypes.DATEONLY,
        allowNull: false,
             get() {
  const raw = this.getDataValue('FechaAlta');
  if (!raw) return null;

  const dateObj = raw instanceof Date ? raw : new Date(raw);
  return dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
  }
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