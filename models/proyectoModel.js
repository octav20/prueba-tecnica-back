const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Proyecto = sequelize.define('Proyecto', {
    ID_Proyecto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID_Proyecto'
    },
    NombreProyecto: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true 
    },
    FechaInicio: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
            get() {
   const raw = this.getDataValue('FechaInicio');
  if (!raw) return null;

  const dateObj = raw instanceof Date ? raw : new Date(raw);
  return dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
  }
    },
    FechaFin: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
          get() {
  const raw = this.getDataValue('FechaFin');
  if (!raw) return null;

  const dateObj = raw instanceof Date ? raw : new Date(raw);
  return dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
  }
    },
    Estatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true 
    }
}, {
    tableName: 'Proyectos', 
    timestamps: false
});

module.exports = Proyecto;
