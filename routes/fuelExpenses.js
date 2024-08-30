const express = require('express');
const { addFuelExpense, getAllFuelExpensesByTruckId, deleteFuelExpenseById } = require('../controllers/fuelExpenses');

const router = express.Router();

router.post('/addFuelExpense', addFuelExpense);
router.get('/getAllFuelExpensesByTruckId', getAllFuelExpensesByTruckId);
router.delete('/deleteFuelExpenseById/:id', deleteFuelExpenseById);

module.exports = router;
