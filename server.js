const express = require('express');
const cors = require('cors');
require('dotenv').config();

const defineAssociations = require('./models/associations');

const empleadoRoutes = require('./routes/empleados');
const proyectoRoutes = require('./routes/proyectos');
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares globales
app.use(cors()); // Permite peticiones de otros dominios (frontend)
app.use(express.json()); // Habilita body-parser para JSON

// Definición de rutas base
app.use('/api/empleados', empleadoRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API de Gestión  - Node.js Running');
});
// Importa la función de conexión
const { connectDB } = require('./config/db'); 
const PORT = process.env.PORT || 3001;
// Llama a la conexión antes de levantar el servidor
connectDB().then(() => {
    defineAssociations(); 
    app.listen(PORT, () => console.log(`Servidor Node corriendo en el puerto ${PORT}`));
});