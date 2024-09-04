const express = require('express');
const { getAllTotalExpensesByUserId, downloadAllTotalExpensesExcel } = require('../controllers/totalExpenses');

const router = express.Router();

router.get('/getAllTotalExpensesByUserId', getAllTotalExpensesByUserId);
router.get('/downloadAllTotalExpensesExcel', downloadAllTotalExpensesExcel);

module.exports = router;
