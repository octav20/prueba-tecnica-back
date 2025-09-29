const Usuario = require('../models/usuarioModel'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
    const { nombreUsuario, contraseña } = req.body;

    if (!nombreUsuario || !contraseña) {
        return res.status(400).json({ msg: 'Debe ingresar nombre de usuario y contraseña.' });
    }

    try {
        const user = await Usuario.findOne({ where: { NombreUsuario: nombreUsuario } });

        if (!user) {
            return res.status(401).json({ msg: 'Usuario no encontrado.' });
        }

        const isMatch = await bcrypt.compare(contraseña, user.ContraseñaHash);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Contraseña incorrecta.' });
        }

        //Generar JWT
        const payload = {
            user: {
                id: user.ID_Usuario,
                rol: user.Rol 
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token }); 
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};