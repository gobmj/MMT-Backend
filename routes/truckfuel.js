const express = require('express');
const { addTruck, getTruckById, getAllTrucks, getTruckByUser, updateTruckById, deleteTruckById } = require('../controllers/truck'); // Adjust the path as needed

const router = express.Router();

router.post('/addTruck', addTruck); //done
router.get('/getAllTrucks', getAllTrucks); //done
router.get('/getTruckById/:id', getTruckById);  //done
router.get('/getAllTrucksByUser/:userId', getTruckByUser); //done
router.put('/updateTruckById/:id', updateTruckById);
router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
