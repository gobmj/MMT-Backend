const express = require('express');
const { addTruck, getTruckById, getAllTrucks, getAllTruckByUser, updateTruckById, deleteTruckById } = require('../controllers/truck'); // Adjust the path as needed

const router = express.Router();

router.post('/addTruck', addTruck);
router.get('/getAllTrucks', getAllTrucks);
router.get('/getTruckById/:id', getTruckById); 
router.get('/getAllTrucksByUser/:userId', getAllTruckByUser);
router.put('/updateTruckById/:id', updateTruckById);
router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
