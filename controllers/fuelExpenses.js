const FuelExpense = require("../models/fuelExpense-model"); // Adjust the path as needed

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
    const { truckId } = req.query;

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required" });
    }

    // Fetch all fuel expenses for the given truckId
    const fuelExpenses = await FuelExpense.find({ truckId }).sort({ date: 1 });

    if (fuelExpenses.length === 0) {
      return res
        .status(404)
        .json({ message: "No fuel expenses found for this truck" });
    }

    // Calculate mileage and range, and format the date
    const formattedFuelExpenses = fuelExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      // Calculate mileage
      const mileage =
        index > 0 ? expense.currentKM - fuelExpenses[index - 1].currentKM : 0;

      // Calculate range - Assuming range is not given and not calculated here
      // If you have a formula for range, apply it here. For now, I set it as the mileage.
      const range = mileage; // Adjust this if you have a specific formula for range

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
