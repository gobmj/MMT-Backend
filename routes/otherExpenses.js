const express = require('express');
const { addOtherExpense, getAllOtherExpensesByTruckId,getAllOtherExpensesByUserId, deleteOtherExpenseById, downloadOtherExpensesExcel } = require('../controllers/otherExpenses');

const router = express.Router();

router.post('/addOtherExpense', addOtherExpense);
router.get('/getAllOtherExpensesByTruckId', getAllOtherExpensesByTruckId);
router.get('/getAllOtherExpensesByUserId', getAllOtherExpensesByUserId);
router.delete('/deleteOtherExpenseById/:id', deleteOtherExpenseById);
router.get('/downloadOtherExpensesExcel', downloadOtherExpensesExcel);

module.exports = router;
