const Empleado = require('../models/empleadoModel');
const Proyecto = require('../models/proyectoModel');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

function calculateBirthDateLimit(age) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  return date;
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isAlphaOnly = (str) => {
  const alphaRegex = /^[a-zA-Z\s]+$/;
  return alphaRegex.test(str);
};

const validateEmployeeData = (empleadoData) => {
  const {
    Nombre,
    ApellidoPaterno,
    ApellidoMaterno,
    FechaNacimiento,
    FechaAlta,
    Sueldo,
    Correo,
  } = empleadoData;

  if (
    !Nombre ||
    !ApellidoPaterno ||
    !ApellidoMaterno ||
    !FechaNacimiento ||
    !FechaAlta ||
    Sueldo === undefined ||
    Sueldo === null ||
    !Correo
  ) {
    return { valid: false, msg: 'Todos los campos son obligatorios.' };
  }

  if (!isAlphaOnly(Nombre)) {
    return {
      valid: false,
      msg: 'El campo Nombre solo puede contener letras y espacios.',
    };
  }
  if (!isAlphaOnly(ApellidoPaterno)) {
    return {
      valid: false,
      msg: 'El campo Apellido Paterno solo puede contener letras y espacios.',
    };
  }
  if (!isAlphaOnly(ApellidoMaterno)) {
    return {
      valid: false,
      msg: 'El campo Apellido Materno solo puede contener letras y espacios.',
    };
  }

  if (!isValidEmail(Correo)) {
    return {
      valid: false,
      msg: 'El formato del correo electrónico no es válido.',
    };
  }

  if (isNaN(Sueldo) || Sueldo < 0) {
    return { valid: false, msg: 'El sueldo debe ser un número positivo.' };
  }

  const edad = calculateAge(FechaNacimiento);
  if (edad < 18) {
    return {
      valid: false,
      msg: `La edad mínima para el alta es de 18 años. Edad calculada: ${edad}`,
    };
  }

  const fechaNacimiento = new Date(FechaNacimiento);
  const fechaAlta = new Date(FechaAlta);

  if (
    fechaNacimiento.toString() === 'Invalid Date' ||
    fechaAlta.toString() === 'Invalid Date'
  ) {
    return {
      valid: false,
      msg: 'Una o ambas fechas no tienen un formato válido (YYYY-MM-DD esperado).',
    };
  }

  if (fechaAlta < fechaNacimiento) {
    return {
      valid: false,
      msg: 'La fecha de alta no puede ser anterior a la fecha de nacimiento.',
    };
  }

  return { valid: true };
};

// (POST /api/empleados)
exports.createEmpleado = async (req, res) => {
  // validar si el body esta vacio
  if (!req.body) {
    return res
      .status(400)
      .json({ msg: 'El cuerpo de la solicitud no puede estar vacío.' });
  }

  const empleadoData = req.body;

  const validationResult = validateEmployeeData(empleadoData);
  if (!validationResult.valid) {
    return res.status(400).json({ msg: validationResult.msg });
  }

  try {
    const nuevoEmpleado = await Empleado.create(empleadoData);
    res.status(201).json(nuevoEmpleado);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(400)
        .json({
          msg: 'El correo electrónico ya está registrado (debe ser único).',
        });
    }
    console.error('Error al crear empleado:', err);
    res.status(500).json({ msg: 'Error interno al crear empleado.' });
  }
};

exports.getEmpleados = async (req, res) => {
  const { nombre, minAge, maxAge, proyectoId } = req.query;
  let whereClause = {};
  const employeeAttributes = [
    'ID_Empleado',
    'Nombre',
    'ApellidoPaterno',
    'ApellidoMaterno',
    'FechaNacimiento',
    'FechaAlta',
    'Sueldo',
    'Correo',
    'Estatus',
  ];

  let projectInclude = {
    model: Proyecto,
    as: 'Proyectos',
    required: false,
    attributes: ['ID_Proyecto', 'NombreProyecto', 'Estatus'],
    through: { attributes: ['FechaAsignacion'] },
  };

  if (nombre) {
    const searchName = `%${nombre}%`;
    whereClause[Op.or] = [
      { Nombre: { [Op.like]: searchName } },
      { ApellidoPaterno: { [Op.like]: searchName } },
      { ApellidoMaterno: { [Op.like]: searchName } },
    ];
  }

  //FILTRO POR RANGO DE EDAD
  if (minAge || maxAge) {
    const ageConditions = {};
    const min = parseInt(minAge, 10);
    const max = parseInt(maxAge, 10);

    if (minAge && !isNaN(min)) {
      ageConditions[Op.lte] = calculateBirthDateLimit(min, 'min');
    }

    if (maxAge && !isNaN(max)) {
      ageConditions[Op.gt] = calculateBirthDateLimit(max, 'max');
    }

    if (Object.keys(ageConditions).length > 0) {
      whereClause.FechaNacimiento = { ...ageConditions };
    }
  }

  //  FILTRO POR PROYECTO
  if (proyectoId && !isNaN(parseInt(proyectoId))) {
    projectInclude.required = true; // INNER JOIN para filtrar
    projectInclude.through.where = { ID_Proyecto: parseInt(proyectoId) };
  }

  try {
    const empleados = await Empleado.findAll({
      where: whereClause,
      attributes: employeeAttributes,
      include: [projectInclude],
      order: [
        ['ApellidoPaterno', 'ASC'],
        ['ApellidoMaterno', 'ASC'],
        ['Nombre', 'ASC'],
      ],
    });
    res.json(empleados);
  } catch (err) {
    console.error('Error al obtener o buscar empleados:', err);
    res.status(500).json({ msg: 'Error al obtener o buscar empleados.' });
  }
};

// (getEmpleadoById)
exports.getEmpleadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ msg: 'Empleado no encontrado.' });
    }
    res.json(empleado);
  } catch (err) {
    console.error('Error al obtener empleado por ID:', err);
    res.status(500).json({ msg: 'Error al obtener empleado.' });
  }
};

// (PUT /api/empleados/:id)
exports.updateEmpleado = async (req, res) => {
  // validar si el body esta vacio
  if (!req.body) {
    return res
      .status(400)
      .json({ msg: 'El cuerpo de la solicitud no puede estar vacío.' });
  }
  const empleadoData = req.body;
  const { id } = req.params;

  if (empleadoData.FechaNacimiento) {
    const edad = calculateAge(empleadoData.FechaNacimiento);
    if (edad < 18) {
      return res
        .status(400)
        .json({
          msg: `La edad mínima debe ser de 18 años. Edad calculada: ${edad}`,
        });
    }
  }
  if (empleadoData.Correo && !isValidEmail(empleadoData.Correo)) {
    return res
      .status(400)
      .json({ msg: 'El formato del correo electrónico no es válido.' });
  }
  if (
    empleadoData.Sueldo !== undefined &&
    (isNaN(empleadoData.Sueldo) || empleadoData.Sueldo < 0)
  ) {
    return res
      .status(400)
      .json({ msg: 'El sueldo debe ser un número positivo.' });
  }

  try {
    if (empleadoData.Correo) {
      const empleadoActual = await Empleado.findByPk(id, {
        attributes: ['Correo'],
      });

      if (!empleadoActual) {
        return res.status(404).json({ msg: 'Empleado no encontrado.' });
      }

      if (empleadoActual.Correo === empleadoData.Correo) {
        delete empleadoData.Correo;
      }
    }

    if (empleadoData.Estatus !== undefined) delete empleadoData.Estatus;
    if (empleadoData.FechaAlta !== undefined) delete empleadoData.FechaAlta;
    const [updatedRows] = await Empleado.update(empleadoData, {
      where: { ID_Empleado: id },
    });

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ msg: 'Empleado no encontrado o no se realizaron cambios.' });
    }

    const updatedEmpleado = await Empleado.findByPk(id);
    res.json(updatedEmpleado);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(400)
        .json({ msg: 'El correo electrónico ya está en uso.' });
    }
    console.error('Error al actualizar empleado:', err);
    res.status(500).json({ msg: 'Error al actualizar empleado.' });
  }
};

// (deleteEmpleado)
exports.deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    const [updatedRows] = await Empleado.update(
      { Estatus: false },
      {
        where: { ID_Empleado: id },
      }
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ msg: 'Empleado no encontrado o ya está inactivo.' });
    }

    res.json({ msg: 'Empleado dado de baja (Estatus=0).' });
  } catch (err) {
    console.error('Error al dar de baja empleado:', err);
    res.status(500).json({ msg: 'Error al dar de baja empleado.' });
  }
};
