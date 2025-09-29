const { Op } = require('sequelize');
const Proyecto = require('../models/proyectoModel');
const Empleado = require('../models/empleadoModel');
const ProyectoEmpleado = require('../models/proyectoEmpleadoModel'); 


const validateProjectDates = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio.toString() === 'Invalid Date' || fin.toString() === 'Invalid Date') {
        return { valid: false, msg: 'Las fechas de inicio o fin no son válidas.' };
    }
    if (fin < inicio) {
        return { valid: false, msg: 'La fecha de fin no puede ser anterior a la fecha de inicio.' };
    }
    return { valid: true };
};


// POST /api/proyectos
exports.createProyecto = async (req, res) => {
    if(!req.body){
        return res.status(400).json({ msg: 'El cuerpo de la solicitud no puede estar vacío.' });
    }
    const { NombreProyecto, FechaInicio, FechaFin, Integrantes = [] } = req.body;

    // Validación de campos obligatorios
    if (!NombreProyecto || !FechaInicio || !FechaFin) {
        return res.status(400).json({ msg: 'Faltan campos obligatorios: NombreProyecto, FechaInicio, FechaFin.' });
    }

    // Validación de fechas
    const dateValidation = validateProjectDates(FechaInicio, FechaFin);
    if (!dateValidation.valid) {
        return res.status(400).json({ msg: dateValidation.msg });
    }

    try {
        if (Integrantes.length > 0) {
            const empleadosActivos = await Empleado.findAll({
                where: {
                    ID_Empleado: { [Op.in]: Integrantes },
                    Estatus: true 
                },
                attributes: ['ID_Empleado', 'Estatus']
            });

            if (empleadosActivos.length !== Integrantes.length) {
                const activosIds = empleadosActivos.map(e => e.ID_Empleado);
                const invalidIds = Integrantes.filter(id => !activosIds.includes(id));
                return res.status(400).json({ 
                    msg: 'Algunos integrantes no existen o no están activos.',
                    invalidIds 
                });
            }
        }
        
        const nuevoProyecto = await Proyecto.create({ NombreProyecto, FechaInicio, FechaFin });
        
        if (Integrantes.length > 0) {
            await nuevoProyecto.addIntegrantes(Integrantes);
        }

        const proyectoConIntegrantes = await Proyecto.findByPk(nuevoProyecto.ID_Proyecto, {
            include: [{ model: Empleado, as: 'Integrantes', attributes: ['ID_Empleado', 'Nombre', 'ApellidoPaterno'] }]
        });

        res.status(201).json(proyectoConIntegrantes);

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'Ya existe un proyecto con ese nombre.' });
        }
        console.error("Error al crear proyecto:", err);
        res.status(500).json({ msg: 'Error interno al crear proyecto.', details: err.message });
    }
};

// (GET /api/proyectos?nombre=X&fechaMin=Y)
exports.getProyectos = async (req, res) => {
    const { nombre, fechaInicioMin, fechaFinMax } = req.query;
    const whereClause = {};

    // FILTRO POR NOMBRE
    if (nombre) {
        whereClause.NombreProyecto = { [Op.like]: `%${nombre}%` };
    }

    // FILTRO POR RANGO DE FECHAS (Duración del proyecto)
    if (fechaInicioMin) {
        whereClause.FechaInicio = { [Op.gte]: new Date(fechaInicioMin) };
    }
    if (fechaFinMax) {
        whereClause.FechaFin = { 
            ...whereClause.FechaFin, 
            [Op.lte]: new Date(fechaFinMax) 
        };
    }
    
    try {
        const proyectos = await Proyecto.findAll({ 
            where: whereClause,
            include: [{ 
                model: Empleado, 
                as: 'Integrantes', 
                attributes: ['ID_Empleado', 'Nombre', 'ApellidoPaterno'],
                through: { attributes: [] } 
            }]
        });
        if (proyectos.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron proyectos con los criterios especificados.' });
        }
        res.json(proyectos);
    } catch (err) {
        console.error("Error al consultar proyectos:", err);
        res.status(500).send('Error al consultar proyectos.');
    }
};

//(GET /api/proyectos/:id)
exports.getProyectoById = async (req, res) => {
    try {
        const proyecto = await Proyecto.findByPk(req.params.id, {
            include: [{ 
                model: Empleado, 
                as: 'Integrantes', 
                attributes: ['ID_Empleado', 'Nombre', 'ApellidoPaterno', 'Correo']
            }]
        });

        if (!proyecto) {
            return res.status(404).json({ msg: 'Proyecto no encontrado.' });
        }
        res.json(proyecto);
    } catch (err) {
        console.error("Error al obtener proyecto por ID:", err);
        res.status(500).send('Error al consultar proyecto por ID.');
    }
};

// PUT /api/proyectos/:id
exports.updateProyecto = async (req, res) => {
    if(!req.body){
        return res.status(400).json({ msg: 'El cuerpo de la solicitud no puede estar vacío.' });
    }
    const { id } = req.params;
    const { NombreProyecto, FechaInicio, FechaFin } = req.body;

    if (!NombreProyecto || !FechaInicio || !FechaFin) {
        return res.status(400).json({ msg: 'Debe proporcionar Nombre, FechaInicio y FechaFin.' });
    }
    
    const dateValidation = validateProjectDates(FechaInicio, FechaFin);
    if (!dateValidation.valid) {
        return res.status(400).json({ msg: dateValidation.msg });
    }

    try {
        const [updatedRows] = await Proyecto.update(
            { NombreProyecto, FechaInicio, FechaFin },
            { where: { ID_Proyecto: id } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Proyecto no encontrado o datos idénticos.' });
        }
        
        const updatedProyecto = await Proyecto.findByPk(id);
        res.json(updatedProyecto);

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'Ya existe otro proyecto con ese nombre.' });
        }
        console.error("Error al actualizar proyecto:", err);
        res.status(500).json({ msg: 'Error al actualizar proyecto.', details: err.message });
    }
};
//  (DELETE /api/proyectos/:id)
exports.deleteProyecto = async (req, res) => {
    const {id} = req.params;
    try {
        const [updatedRows] = await Proyecto.update(
            {Estatus: false},
            {where: {ID_Proyecto: id}}
        );

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Proyecto no encontrado o ya inactivo.' });
        }

        res.json({ msg: 'Proyecto dado de baja exitosamente.' });

    } catch (err) {
        console.error("Error al eliminar proyecto:", err.message);
        res.status(500).send('Error al eliminar el proyecto.');
    }
};

// /api/proyectos/:id/empleados/:empleadoId
exports.addEmployeeToProject = async (req, res) => {
    const { id: proyectoId, empleadoId } = req.params;

    try {
        const proyecto = await Proyecto.findByPk(proyectoId);
        const empleado = await Empleado.findByPk(empleadoId);

        if (!proyecto || !empleado) {
            return res.status(404).json({ msg: 'Proyecto o Empleado no encontrado.' });
        }
        
        if (!empleado.Estatus) {
            return res.status(400).json({ msg: 'Solo se pueden asignar empleados activos.' });
        }
        
        await proyecto.addIntegrantes(empleado);

        res.json({ msg: `Empleado ${empleadoId} añadido al proyecto ${proyectoId}.` });

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: 'El empleado ya está asignado a este proyecto.' });
        }
        console.error("Error al añadir empleado al proyecto:", err);
        res.status(500).json({ msg: 'Error al añadir empleado.' });
    }
};

// DELETE /api/proyectos/:id/empleados/:empleadoId
exports.removeEmployeeFromProject = async (req, res) => {
    const { id: proyectoId, empleadoId } = req.params;

    try {
        const proyecto = await Proyecto.findByPk(proyectoId);
        const empleado = await Empleado.findByPk(empleadoId);

        if (!proyecto || !empleado) {
            return res.status(404).json({ msg: 'Proyecto o Empleado no encontrado.' });
        }
        
        await proyecto.removeIntegrantes(empleado);

        res.json({ msg: `Empleado ${empleadoId} eliminado del proyecto ${proyectoId}.` });

    } catch (err) {
        console.error("Error al eliminar empleado del proyecto:", err);
        res.status(500).json({ msg: 'Error al eliminar empleado.' });
    }
};

exports.getEmpleadosByProject = async (req, res) => {
    try {
        const proyecto = await Proyecto.findByPk(req.params.id, {
            include: [{ 
                model: Empleado, 
                as: 'Integrantes', 
                attributes: { exclude: ['Sueldo', 'Correo', 'Estatus'] }
            }]
        });

        if (!proyecto) {
            return res.status(404).json({ msg: 'Proyecto no encontrado.' });
        }
        
        res.json(proyecto.Integrantes);
    } catch (err) {
        console.error("Error al obtener empleados por proyecto:", err.message);
        res.status(500).send('Error al consultar empleados del proyecto.');
    }
};
