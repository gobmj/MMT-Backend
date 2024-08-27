const express = require('express');
const { addOtherExpense, getAllOtherExpensesByTruckId } = require('../controllers/otherExpenses');

const router = express.Router();

router.post('/addOtherExpense', addOtherExpense);
router.get('/getAllOtherExpensesByTruckId', getAllOtherExpensesByTruckId);
// router.get('/getAllTrucks', getAllTrucks);
// router.get('/getTruckById/:id', getTruckById); 
// router.get('/getAllTrucksByUser/:userId', getAllTruckByUser);
// router.put('/updateTruckById/:id', updateTruckById);
// router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
