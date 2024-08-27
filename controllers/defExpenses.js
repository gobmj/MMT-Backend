const DefExpense = require('../models/defExpense-model'); // Adjust the path as needed

// Controller to add a new def filling record
const addDefExpense = async (req, res) => {
    try {
        const { truckId, date, currentKM, litres, cost, note } = req.body;

        console.log(req.body);
        

        const newDefExpense = new DefExpense({
            truckId,
            date,
            currentKM,
            litres,
            cost,
            note,
        });

        const savedDefExpense = await newDefExpense.save();
        res.status(201).json(savedDefExpense);
    } catch (error) {
        console.error('Error adding def expenses:', error);
        res.status(500).json({ message: 'Failed to add def expenses' });
    }
};

module.exports = {
    addDefExpense,
};
