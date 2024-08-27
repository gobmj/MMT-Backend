const express = require('express');
const { addDefExpense } = require('../controllers/defExpenses');

const router = express.Router();

router.post('/addDefExpense', addDefExpense);
// router.get('/getAllTrucks', getAllTrucks);
// router.get('/getTruckById/:id', getTruckById); 
// router.get('/getAllTrucksByUser/:userId', getAllTruckByUser);
// router.put('/updateTruckById/:id', updateTruckById);
// router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
