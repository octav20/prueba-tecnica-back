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
        allowNull: false
    },
    FechaFin: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
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
