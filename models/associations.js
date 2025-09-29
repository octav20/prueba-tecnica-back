const Empleado = require('./empleadoModel');
const Proyecto = require('./proyectoModel');
const ProyectoEmpleado = require('./proyectoEmpleadoModel');


const defineAssociations = () => {
    // ---------------------------------------------
    // 1. Relación Muchos a Muchos (M:M) entre Empleado y Proyecto
    // ---------------------------------------------
    
    // Un Empleado pertenece a muchos Proyectos, a través de la tabla ProyectoEmpleado
    Empleado.belongsToMany(Proyecto, {
        through: ProyectoEmpleado,
        foreignKey: 'ID_Empleado',
        otherKey: 'ID_Proyecto', 
        as: 'Proyectos'          
    });

    // Un Proyecto pertenece a muchos Empleados, a través de la tabla ProyectoEmpleado
    Proyecto.belongsToMany(Empleado, {
        through: ProyectoEmpleado,
        foreignKey: 'ID_Proyecto', 
        otherKey: 'ID_Empleado',  
        as: 'Integrantes'         
    });

    // ---------------------------------------------
    // 2. Relaciones Uno a Muchos (1:M) con la tabla pivote (opcional, pero útil)
    // ---------------------------------------------

    // Un Proyecto está asociado con múltiples asignaciones en la tabla pivote
    Proyecto.hasMany(ProyectoEmpleado, {
        foreignKey: 'ID_Proyecto'
    });
    // Una asignación en la tabla pivote pertenece a un Proyecto
    ProyectoEmpleado.belongsTo(Proyecto, {
        foreignKey: 'ID_Proyecto'
    });

    // Un Empleado está asociado con múltiples asignaciones en la tabla pivote
    Empleado.hasMany(ProyectoEmpleado, {
        foreignKey: 'ID_Empleado'
    });
    // Una asignación en la tabla pivote pertenece a un Empleado
    ProyectoEmpleado.belongsTo(Empleado, {
        foreignKey: 'ID_Empleado'
    });
    
    console.log("Asociaciones de Sequelize definidas correctamente.");
};

module.exports = defineAssociations;
