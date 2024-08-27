const OtherExpense = require("../models/otherExpense-model"); // Adjust the path as needed
const moment = require("moment");

// Controller to add a new other filling record
const addOtherExpense = async (req, res) => {
  try {
    const { truckId, addedBy, date, category, cost, note } = req.body;

    console.log(req.body);

    const newOtherExpense = new OtherExpense({
      truckId,
      addedBy,
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

    // Parse and format dates
    const startDate = selectedDates
      ? moment(selectedDates[0]).startOf("day").toDate()
      : null;
    const endDate = selectedDates
      ? moment(selectedDates[1]).endOf("day").toDate()
      : null;

    console.log(startDate, endDate);

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required" });
    }

    // Build the query filter
    const query = { truckId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const otherExpenses = await OtherExpense.find( query ).sort({ date: 1 });

    if (otherExpenses.length === 0) {
      return res.status(404).json({
        message:
          "No other expenses found for this truck in the given date range",
      });
    }
    const formattedOtherExpenses = otherExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      return {
        ...expense.toObject(), // Convert Mongoose document to plain object
        date: formattedDate,
      };
    });
    res.status(200).json(formattedOtherExpenses.reverse());
  } catch (error) {
    console.error("Error retrieving other expenses:", error);
    res.status(500).json({ message: "Failed to retrieve other expenses" });
  }
};

module.exports = {
  addOtherExpense,
  getAllOtherExpensesByTruckId,
};
