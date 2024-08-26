const FuelExpense = require('../models/fuelExpenses-model'); // Adjust the path as needed

// Controller to add a new fuel filling record
const addFuelExpense = async (req, res) => {
    try {
        const { truckId, date, currentKM, litres, cost, note } = req.body;

        const newFuelExpense = new FuelExpense({
            truckId,
            date,
            currentKM,
            litres,
            cost,
            note,
        });

        const savedFuelExpense = await newFuelExpense.save();
        res.status(201).json(savedFuelExpense);
    } catch (error) {
        console.error('Error adding fuel filling:', error);
        res.status(500).json({ message: 'Failed to add fuel filling' });
    }
};

module.exports = {
    addFuelExpense,
};
