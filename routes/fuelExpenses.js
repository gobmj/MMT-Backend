const express = require('express');
const { addFuelExpense, getAllFuelExpensesByTruckId, deleteFuelExpenseById, downloadFuelExpensesExcel } = require('../controllers/fuelExpenses');

const router = express.Router();

router.post('/addFuelExpense', addFuelExpense);
router.get('/getAllFuelExpensesByTruckId', getAllFuelExpensesByTruckId);
router.delete('/deleteFuelExpenseById/:id', deleteFuelExpenseById);
router.get('/downloadFuelExpensesExcel', downloadFuelExpensesExcel);

module.exports = router;
