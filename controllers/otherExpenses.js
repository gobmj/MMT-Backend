const OtherExpense = require('../models/otherExpense-model'); // Adjust the path as needed

// Controller to add a new other filling record
const addOtherExpense = async (req, res) => {
    try {
        const { truckId, date, category, cost, note } = req.body;

        console.log(req.body);
        

        const newOtherExpense = new OtherExpense({
            truckId,
            date,
            category,
            cost,
            note,
        });

        const savedOtherExpense = await newOtherExpense.save();
        res.status(201).json(savedOtherExpense);
    } catch (error) {
        console.error('Error adding other filling:', error);
        res.status(500).json({ message: 'Failed to add other filling' });
    }
};

module.exports = {
    addOtherExpense,
};
