const express = require('express');
const { getAllTotalExpensesByUserId } = require('../controllers/totalExpenses');

const router = express.Router();

router.get('/getAllTotalExpensesByUserId', getAllTotalExpensesByUserId);

module.exports = router;
