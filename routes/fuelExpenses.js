const express = require('express');
const { addFuelExpense, getAllFuelExpensesByTruckId,getAllFuelExpensesByUserId, deleteFuelExpenseById, downloadFuelExpensesExcel,downloadAllFuelExpensesExcel } = require('../controllers/fuelExpenses');

const router = express.Router();

router.post('/addFuelExpense', addFuelExpense);
router.get('/getAllFuelExpensesByTruckId', getAllFuelExpensesByTruckId);
router.get('/getAllFuelExpensesByUserId', getAllFuelExpensesByUserId);
router.delete('/deleteFuelExpenseById/:id', deleteFuelExpenseById);
router.get('/downloadFuelExpensesExcel', downloadFuelExpensesExcel);
router.get('/downloadAllFuelExpensesExcel', downloadAllFuelExpensesExcel);

module.exports = router;
