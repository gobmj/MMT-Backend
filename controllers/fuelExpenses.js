const FuelExpense = require("../models/fuelExpense-model");
const moment = require("moment");

// Controller to add a new fuel filling record
const addFuelExpense = async (req, res) => {
  try {
    const { truckId, addedBy, date, currentKM, litres, cost, note } = req.body;

    console.log(req.body);

    const newFuelExpense = new FuelExpense({
      truckId,
      addedBy,
      date,
      currentKM,
      litres,
      cost,
      note,
    });

    const savedFuelExpense = await newFuelExpense.save();
    res.status(201).json(savedFuelExpense);
  } catch (error) {
    console.error("Error adding fuel filling:", error);
    res.status(500).json({ message: "Failed to add fuel filling" });
  }
};

const getAllFuelExpensesByTruckId = async (req, res) => {
  try {
    const { truckId, selectedDates } = req.query;

    // Parse and format dates
    const startDate = selectedDates
      ? moment(selectedDates[0]).startOf("day").toDate()
      : null;
    const endDate = selectedDates
      ? moment(selectedDates[1]).endOf("day").toDate()
      : null;

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required" });
    }

    // Build the query filter
    const query = { truckId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Fetch all fuel expenses for the given truckId and date range
    const fuelExpenses = await FuelExpense.find(query).sort({ date: 1 });

    if (fuelExpenses.length === 0) {
      return res.status(404).json({
        message:
          "No fuel expenses found for this truck in the given date range",
      });
    }

    // Calculate mileage and range, and format the date
    const formattedFuelExpenses = fuelExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      // Calculate mileage
      const range =
        index > 0 ? expense.currentKM - fuelExpenses[index - 1].currentKM : 0;

      // Calculate range - Assuming range is not given and not calculated here
      // If you have a formula for range, apply it here. For now, I set it as the mileage.
      const mileage = range > 0 ? (range / expense.litres).toFixed(2) : 0; // Adjust this if you have a specific formula for range

      return {
        ...expense.toObject(), // Convert Mongoose document to plain object
        date: formattedDate,
        mileage,
        range,
      };
    });

    res.status(200).json(formattedFuelExpenses.reverse());
  } catch (error) {
    console.error("Error retrieving fuel expenses:", error);
    res.status(500).json({ message: "Failed to retrieve fuel expenses" });
  }
};

module.exports = {
  addFuelExpense,
  getAllFuelExpensesByTruckId,
};
