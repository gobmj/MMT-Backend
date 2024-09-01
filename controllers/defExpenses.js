const { default: mongoose } = require("mongoose");
const DefExpense = require("../models/defExpense-model"); // Adjust the path as needed
const moment = require("moment");

// Controller to add a new def filling record
const addDefExpense = async (req, res) => {
  try {
    const { truckId, addedBy, date, currentKM, litres, cost, note } = req.body;

    const newDefExpense = new DefExpense({
      truckId,
      addedBy,
      date,
      currentKM,
      litres,
      cost,
      note,
    });

    const savedDefExpense = await newDefExpense.save();
    res.status(201).json(savedDefExpense);
  } catch (error) {
    console.error("Error adding def expenses:", error);
    res.status(500).json({ message: "Failed to add def expenses" });
  }
};

const getAllDefExpensesByTruckId = async (req, res) => {
  try {
    const { truckId, selectedDates } = req.query;

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required" });
    }

    // Ensure the dates are in UTC and set the time to 00:00:00 to avoid time zone issues
    const startDate = selectedDates
      ? moment.utc(selectedDates[0]).startOf('day').toDate()
      : null;
    const endDate = selectedDates
      ? moment.utc(selectedDates[1]).endOf('day').toDate()
      : null;

    // Build the query filter
    const query = { truckId };

    if (startDate && endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        // If startDate and endDate are the same, match that specific date
        query.date = {
          $eq: startDate,
        };
      } else {
        // Match the range between startDate and endDate
        query.date = { $gte: startDate, $lte: endDate };
      }
    }

    // Fetch all fuel expenses for the given truckId and date range
    const defExpenses = await DefExpense.find(query).sort({ date: 1 });

    if (defExpenses.length === 0) {
      return res.status(404).json({
        message: "No def expenses found for this truck in the given date range",
      });
    }

    const totalExpense = defExpenses.reduce((sum, expense) => sum + expense.cost, 0);
    
    const formattedDefExpenses = defExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      // const date = new Date(expense.date);
      // const formattedDate = date.toISOString().split("T")[0];

      const date = new Date(expense.date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // Calculate mileage
      const range =
        index > 0 ? expense.currentKM - defExpenses[index - 1].currentKM : 0;

      return {
        ...expense.toObject(), // Convert Mongoose document to plain object
        date: formattedDate,
        range,
        key: index
      };
    });
    res.status(200).json({
      expenses:formattedDefExpenses,
      totalExpense 
  });
  } catch (error) {
    console.error("Error retrieving def expenses:", error);
    res.status(500).json({ message: "Failed to retrieve def expenses" });
  }
};

const deleteDefExpenseById = async (req, res) => {
  try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid Expense ID' });
      }

      const deletedTruck = await DefExpense.findByIdAndDelete(id);

      if (!deletedTruck) {
          return res.status(404).json({ message: 'Expense not found' });
      }

      res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
      console.error('Error deleting truck:', error);
      res.status(500).json({ message: 'Failed to delete Expense', error: error.message });
  }
}

module.exports = {
  addDefExpense,
  getAllDefExpensesByTruckId,
  deleteDefExpenseById
};
