const express = require('express');
const { addTruck } = require('../controllers/truck'); // Adjust the path as needed
const { addFuelFilling } = require('../controllers/fuel'); // Adjust the path as needed

const router = express.Router();

router.post('/addTruck', addTruck);
router.post('/addFuel', addFuelFilling);
router.get('/getAllTrucks', getAllTrucks); 
router.get('/getAllTrucks:id', getTruckById);

module.exports = router;
