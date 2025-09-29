const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const { protect } = require('../middlewares/authMiddleware'); 


router.get('/', protect, empleadoController.getEmpleados);
router.get('/:id', protect, empleadoController.getEmpleadoById);
router.post('/', protect, empleadoController.createEmpleado); 
router.put('/:id', protect,  empleadoController.updateEmpleado);
router.put('/status/:id', protect, empleadoController.deleteEmpleado); 

module.exports = router;