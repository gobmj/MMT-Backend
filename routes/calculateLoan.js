const express = require('express');
const { addLoanCalculation, getAllLoanCalculationsByTruckId,getAllLoanCalculationsByUserId, deleteLoanCalculationById, downloadLoanCalculationsExcel,downloadAllLoanCalculationsExcel } = require('../controllers/calculateLoan');

const router = express.Router();

router.post('/addLoanCalculation', addLoanCalculation);
router.get('/getAllLoanCalculationByTruckId', getAllLoanCalculationsByTruckId);
router.get('/getAllLoanCalculationByUserId', getAllLoanCalculationsByUserId);
router.delete('/deleteCalculateLoanById/:id', deleteLoanCalculationById);
router.get('/downloadLoanCalculationExcel', downloadLoanCalculationsExcel);
router.get('/downloadAllLoanCalculationExcel', downloadAllLoanCalculationsExcel);

module.exports = router;
