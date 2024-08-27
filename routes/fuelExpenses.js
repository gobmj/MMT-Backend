const express = require('express');
const { addFuelExpense, getAllFuelExpensesByTruckId } = require('../controllers/fuelExpenses');

const router = express.Router();

router.post('/addFuelExpense', addFuelExpense);
router.get('/getAllFuelExpensesByTruckId', getAllFuelExpensesByTruckId);
// router.get('/getTruckById/:id', getTruckById); 
// router.get('/getAllTrucksByUser/:userId', getAllTruckByUser);
// router.put('/updateTruckById/:id', updateTruckById);
// router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
