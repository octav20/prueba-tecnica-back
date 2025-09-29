const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyectoController');
const { protect } = require('../middlewares/authMiddleware'); 


router.post('/', protect, proyectoController.createProyecto);

router.get('/', protect, proyectoController.getProyectos); 

router.get('/:id', protect, proyectoController.getProyectoById);

router.put('/:id', protect, proyectoController.updateProyecto);

router.put('/status/:id', protect, proyectoController.deleteProyecto);

router.get('/:id/empleados', protect, proyectoController.getEmpleadosByProject);

router.post('/:id/empleados/:empleadoId', protect, proyectoController.addEmployeeToProject);

router.delete('/:id/empleados/:empleadoId', protect, proyectoController.removeEmployeeFromProject);
module.exports = router;
