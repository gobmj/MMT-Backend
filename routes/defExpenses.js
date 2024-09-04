const express = require('express');
const { addDefExpense, getAllDefExpensesByTruckId,getAllDefExpensesByUserId, deleteDefExpenseById, downloadDefExpensesExcel } = require('../controllers/defExpenses');

const router = express.Router();

router.post('/addDefExpense', addDefExpense);
router.get('/getAllDefExpensesByTruckId', getAllDefExpensesByTruckId);
router.get('/getAllDefExpensesByUserId', getAllDefExpensesByUserId);
router.delete('/deleteDefExpenseById/:id', deleteDefExpenseById);
router.get('/downloadDefExpensesExcel', downloadDefExpensesExcel);

module.exports = router;
