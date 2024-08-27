const express = require('express');
const { addDefExpense, getAllDefExpensesByTruckId } = require('../controllers/defExpenses');

const router = express.Router();

router.post('/addDefExpense', addDefExpense);
router.get('/getAllDefExpensesByTruckId/:truckId', getAllDefExpensesByTruckId);
// router.get('/getAllTrucks', getAllTrucks);
// router.get('/getTruckById/:id', getTruckById); s
// router.get('/getAllTrucksByUser/:userId', getAllTruckByUser);
// router.put('/updateTruckById/:id', updateTruckById);
// router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
