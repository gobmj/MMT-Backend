const express = require('express');
const { getMetadataByTruckId } = require('../controllers/metadata');

const router = express.Router();

router.get('/getMetadataByTruckId', getMetadataByTruckId);
// router.get('/getTruckById/:id', getTruckById); 
// router.get('/getAllTrucksByUser/:userId', getAllTruckByUser);
// router.put('/updateTruckById/:id', updateTruckById);
// router.delete('/deleteTruckById/:id', deleteTruckById);

module.exports = router;
