const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
    // 1. Leer el token del header 'authorization'
    // El frontend debe enviar el token en este header
    const token = req.header('authorization'); 

    // 2. Verificar si no hay token
    if (!token) {
        // 401 Unauthorized
        return res.status(401).json({ msg: 'No hay token, acceso denegado.' });
    }

    try {
        // 3. Verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Adjuntar la información del usuario al objeto request
        // Esto permite que el controlador sepa quién hizo la petición (útil para auditoría o roles)
        req.user = decoded.user;
        
        // 5. Continuar con la ejecución de la siguiente función (el controlador)
        next(); 

    } catch (err) {
        // Si el token es inválido (expirado, modificado, etc.)
        res.status(401).json({ msg: 'Token no válido.' });
    }
};

module.exports = {
    protect
};