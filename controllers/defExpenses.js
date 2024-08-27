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

const getAllDefExpensesByTruckId = async (req, res) => {
    try {
        const { truckId } = req.query;
        
        if (!truckId) {
            return res.status(400).json({ message: 'Truck ID is required' });
        }
        const defExpenses = await DefExpense.find({ truckId }).sort({ date: 1 });
        if (defExpenses.length === 0) {
            
            return res.status(404).json({ message: 'No def expenses found for this truck' });
        }
        const formattedDefExpenses = defExpenses.map((expense, index) => {
            // Format the date to 'YYYY-MM-DD'
            const date = new Date(expense.date);
            const formattedDate = date.toISOString().split('T')[0];

            // Calculate mileage
            const range = index > 0 ? expense.currentKM - defExpenses[index - 1].currentKM : 0;

            return {
                ...expense.toObject(), // Convert Mongoose document to plain object
                date: formattedDate,
                range
            };
        });
        res.status(200).json(formattedDefExpenses.reverse());
    } catch (error) {
        console.error('Error retrieving def expenses:', error);
        res.status(500).json({ message: 'Failed to retrieve def expenses' });
    }
};

module.exports = {
    addDefExpense,
    getAllDefExpensesByTruckId,
};
