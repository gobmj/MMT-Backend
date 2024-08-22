const express = require('express');
const { addTruck, getTruckById, getAllTrucks, updateTruck, deleteTruckById } = require('../controllers/truck'); // Adjust the path as needed
const { addFuelFilling } = require('../controllers/fuel'); // Adjust the path as needed

const router = express.Router();

router.post('/addTruck', addTruck);
router.post('/addFuel', addFuelFilling);
router.get('/getAllTrucks', getAllTrucks); 
router.get('/getAllTrucks:id', getTruckById);
router.put('/updateTruck:id', updateTruck);
router.delete('/deleteTruck', deleteTruckById);

module.exports = router;
