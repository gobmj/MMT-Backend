const { default: mongoose } = require("mongoose");
const OtherExpense = require("../models/otherExpense-model"); // Adjust the path as needed
const moment = require("moment");


const otherNameConversions = {
  "toll": "Toll",
  "pollution": "Pollution",
  "insurance": "Insurance",
  "service&Maintenance": "Service & Maintenance",
  "salary&incentives": "Salary & Incentives",
  "other": "Other",
};


// Controller to add a new other filling record
const addOtherExpense = async (req, res) => {
  try {
    const { truckId, addedBy, date, category, cost, note, other } = req.body;

    const newOtherExpense = new OtherExpense({
      truckId,
      addedBy,
      other,
      date,
      category,
      cost,
      note,
    });

    const savedOtherExpense = await newOtherExpense.save();
    res.status(201).json(savedOtherExpense);
  } catch (error) {
    console.error("Error adding other filling:", error);
    res.status(500).json({ message: "Failed to add other filling" });
  }
};

const getAllOtherExpensesByTruckId = async (req, res) => {
  try {
    const { truckId, selectedDates } = req.query;

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
    }endDate = selectedDates ? moment(selectedDates[1]).toDate() : null;

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required" });
    }

    const otherExpenses = await OtherExpense.find(query).sort({ date: 1 });

    if (otherExpenses.length === 0) {
      return res.status(404).json({
        message:
          "No other expenses found for this truck in the given date range",
      });
    }

    const totalExpense = otherExpenses.reduce((sum, expense) => sum + expense.cost, 0);

    const formattedOtherExpenses = otherExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      return {
        ...expense.toObject(), // Convert Mongoose document to plain object
        date: formattedDate,
        category:
          expense.category === "other" 
            ? expense.other 
            : (otherNameConversions[expense.category] || "Other"),

        key:index
      };
    });
    res.status(200).json({
      expenses:formattedOtherExpenses,
      totalExpense,
  });
  } catch (error) {
    console.error("Error retrieving other expenses:", error);
    res.status(500).json({ message: "Failed to retrieve other expenses" });
  }
};

const deleteOtherExpenseById = async (req, res) => {
  try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid Expense ID' });
      }

      const deletedTruck = await OtherExpense.findByIdAndDelete(id);

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
  addOtherExpense,
  getAllOtherExpensesByTruckId,
  deleteOtherExpenseById
};
