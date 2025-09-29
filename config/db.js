// /config/db.js - Configuración de Sequelize

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_SERVER,
        dialect: process.env.DB_DIALECT,
        logging: true, 
        dialectOptions: {
            options: {
                encrypt: true, 
                trustServerCertificate: true 
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a SQL Server (Sequelize) establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1); 
    }
}

module.exports = {
    sequelize,
    connectDB
};