const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define('Usuario', {
    ID_Usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID_Usuario'
    },
    NombreUsuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    ContraseñaHash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Admin'
    }
}, {
    tableName: 'Usuarios',
    timestamps: false 
});

module.exports = Usuario;