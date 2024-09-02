const { default: mongoose } = require("mongoose");
const FuelExpense = require("../models/fuelExpense-model");
const moment = require("moment");
const XLSX = require("xlsx");

// Controller to add a new fuel filling record
const addFuelExpense = async (req, res) => {
  try {
    const { truckId, addedBy, date, currentKM, litres, cost, note } = req.body;

    console.log(date);

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

    if (!truckId) {
      return res.status(400).json({ message: "Truck ID is required" });
    }

    // Ensure the dates are in UTC and set the time to 00:00:00 to avoid time zone issues
    const startDate = selectedDates
      ? moment.utc(selectedDates[0]).startOf("day").toDate()
      : null;
    const endDate = selectedDates
      ? moment.utc(selectedDates[1]).endOf("day").toDate()
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
    const fuelExpenses = await FuelExpense.find(query).sort({ date: 1 });

    if (fuelExpenses.length === 0) {
      return res.status(404).json({
        message:
          "No fuel expenses found for this truck in the given date range",
      });
    }

    const totalExpense = fuelExpenses.reduce(
      (sum, expense) => sum + expense.cost,
      0
    );

    // Calculate mileage and range, and format the date
    const formattedFuelExpenses = fuelExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      // const date = new Date(expense.date);
      // const formattedDate = date.toISOString().split("T")[0];

      const date = new Date(expense.date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const range =
        index > 0 ? expense.currentKM - fuelExpenses[index - 1].currentKM : 0;

      // Calculate range - Assuming range is not given and not calculated here
      // If you have a formula for range, apply it here. For now, I set it as the mileage.
      const mileage = range > 0 ? (range / expense.litres).toFixed(2) : 0; // Adjust this if you have a specific formula for range

      return {
        ...expense.toObject(),
        date: formattedDate,
        mileage,
        range,
        key: index,
      };
    });

    res.status(200).json({
      expenses: formattedFuelExpenses,
      totalExpense,
    });
  } catch (error) {
    console.error("Error retrieving fuel expenses:", error);
    res.status(500).json({ message: "Failed to retrieve fuel expenses" });
  }
};

const deleteFuelExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense ID" });
    }

    const deletedTruck = await FuelExpense.findByIdAndDelete(id);

    if (!deletedTruck) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Error deleting truck:", error);
    res
      .status(500)
      .json({ message: "Failed to delete Expense", error: error.message });
  }
};

const downloadFuelExpensesExcel = async (req, res) => {
  try {
    const { truckId, selectedDates } = req.query;

    if (!truckId) {
      console.log("Truck ID is missing");
      return res.status(400).json({ message: "Truck ID is required" });
    }

    // Ensure the dates are in UTC and set the time to 00:00:00 to avoid time zone issues
    const startDate = selectedDates
      ? moment.utc(selectedDates[0]).startOf("day").toDate()
      : null;
    const endDate = selectedDates
      ? moment.utc(selectedDates[1]).endOf("day").toDate()
      : null;

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    // Build the query filter
    const query = { truckId };

    if (startDate && endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        // If startDate and endDate are the same, match that specific date
        query.date = { $eq: startDate };
      } else {
        // Match the range between startDate and endDate
        query.date = { $gte: startDate, $lte: endDate };
      }
    }

    console.log("Query:", query);

    // Fetch all def expenses for the given truckId and date range
    const fuelExpenses = await FuelExpense.find(query).sort({ date: 1 });

    if (fuelExpenses.length === 0) {
      console.log("No expenses found for the given query");
      return res.status(404).json({
        message: "No fuel expenses found for this truck in the given date range",
      });
    }

    // Prepare data for Excel
    const data = fuelExpenses.map((expense, index) => {
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      const range =
        index > 0 ? expense.currentKM - fuelExpenses[index - 1].currentKM : 0;

      const mileage = range > 0 ? (range / expense.litres).toFixed(2) : 0;

      return {
        Date: formattedDate,
        "Current KM": expense.currentKM,
        Litres: expense.litres,
        Cost: expense.cost,
        Note: expense.note || "",
        Range: range,
        Mileage: mileage,
      };
    });

    console.log("Data for Excel:", data);

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Fuel Expenses");

    // Write the workbook to a buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set headers for the response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=fuelExpenses.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res
      .status(500)
      .json({ message: "Failed to generate Excel file", error: error.message });
  }
};

module.exports = {
  addFuelExpense,
  getAllFuelExpensesByTruckId,
  deleteFuelExpenseById,
  downloadFuelExpensesExcel,
};
