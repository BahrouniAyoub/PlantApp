const express = require('express');
const plantController = require('../controllers/plantController.js');
const { authenticate } = require("../middleware/authMiddleware.js")
const router = express.Router();

router.use(authenticate);

router.post('/', plantController.addPlant);

router.get('/:id', plantController.getPlants);

router.put('/:id', plantController.updatePlant);

router.delete('/:id', plantController.deletePlant);

module.exports = router;