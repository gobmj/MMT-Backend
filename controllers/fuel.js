const FuelFilling = require('../models/fuel-filling-model'); // Adjust the path as needed

// Controller to add a new fuel filling record
const addFuelFilling = async (req, res) => {
    try {
        const { truckId, date, currentKM, litres, cost, note } = req.body;

        const newFuelFilling = new FuelFilling({
            truckId,
            date,
            currentKM,
            litres,
            cost,
            note,
        });

        const savedFuelFilling = await newFuelFilling.save();
        res.status(201).json(savedFuelFilling);
    } catch (error) {
        console.error('Error adding fuel filling:', error);
        res.status(500).json({ message: 'Failed to add fuel filling' });
    }
};

module.exports = {
    addFuelFilling,
};
