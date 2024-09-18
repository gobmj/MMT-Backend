const { default: mongoose } = require("mongoose");
const FuelExpense = require("../models/fuelExpense-model");
const moment = require("moment");
const ExcelJS = require("exceljs");
const TruckExpense = require("../models/truck-model");

// Controller to add a new fuel filling record
const addFuelExpense = async (req, res) => {
  try {
    const { truckId, addedBy, date, currentKM, litres, cost, note } = req.body;

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

const getAllFuelExpensesByUserId = async (req, res) => {
  try {
    const { userId, selectedDates } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Ensure the dates are in UTC and set the time to 00:00:00 to avoid time zone issues
    const startDate = selectedDates
      ? moment.utc(selectedDates[0]).startOf("day").toDate()
      : null;
    const endDate = selectedDates
      ? moment.utc(selectedDates[1]).endOf("day").toDate()
      : null;

    // Build the query filter
    const query = { addedBy: userId };

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

    // Fetch all fuel expenses for the given userId and date range
    const fuelExpenses = await FuelExpense.find(query).sort({ date: 1 });

    if (fuelExpenses.length === 0) {
      return res.status(404).json({
        message: "No fuel expenses found for this user in the given date range",
      });
    }

    // Find registration numbers for each truckId in the fuel expenses
    const formattedFuelExpenses = await Promise.all(
      fuelExpenses.map(async (expense, index) => {
        const truck = await TruckExpense.findById(expense.truckId);
        const registrationNo = truck ? truck.registrationNo : "Unknown";

        const date = new Date(expense.date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        return {
          ...expense.toObject(),
          date: formattedDate,
          registrationNo,
          key: index,
        };
      })
    );

    const totalExpense = fuelExpenses.reduce(
      (sum, expense) => sum + expense.cost,
      0
    );

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

    // Fetch all fuel expenses for the given truckId and date range
    const fuelExpenses = await FuelExpense.find(query).sort({ date: 1 });
    const truck = await TruckExpense.findById(truckId);

    console.log("truck", truck);

    if (fuelExpenses.length === 0) {
      console.log("No expenses found for the given query");
      return res.status(404).json({
        message:
          "No fuel expenses found for this truck in the given date range",
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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Fuel Expenses");

    // Add the merged header row
    worksheet.mergeCells("A1:G1");
    worksheet.getCell(
      "A1"
    ).value = `${truck.registrationNo} - Fuel Expenses ( ${selectedDates[0]} - ${selectedDates[1]} )`;
    worksheet.getCell("A1").font = { bold: true };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black background
    };
    worksheet.getCell("A1").font.color = { argb: "FFFFFF" }; // White font color
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add the headings
    const headings = [
      "Date",
      "Current KM",
      "Litres",
      "Cost",
      "Note",
      "Range",
      "Mileage",
    ];
    worksheet.addRow(headings).font = { bold: true };

    // Add the data
    data.forEach((row) => {
      worksheet.addRow([
        row.Date,
        row["Current KM"],
        row.Litres,
        row.Cost,
        row.Note,
        row.Range,
        row.Mileage,
      ]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

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

const downloadAllFuelExpensesExcel = async (req, res) => {
  try {
    const { userId, selectedDates } = req.query;

    if (!userId) {
      console.log("User ID is missing");
      return res.status(400).json({ message: "User ID is required" });
    }

    const startDate = selectedDates
      ? moment.utc(selectedDates[0]).startOf("day").toDate()
      : null;
    const endDate = selectedDates
      ? moment.utc(selectedDates[1]).endOf("day").toDate()
      : null;

    const query = { addedBy: userId };

    if (startDate && endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        query.date = { $eq: startDate };
      } else {
        query.date = { $gte: startDate, $lte: endDate };
      }
    }

    const fuelExpenses = await FuelExpense.find(query).sort({ date: 1 });

    if (fuelExpenses.length === 0) {
      console.log("No expenses found for the given query");
      return res.status(404).json({
        message: "No fuel expenses found for this user in the given date range",
      });
    }

    // Prepare data for Excel with registration number
    const data = await Promise.all(
      fuelExpenses.map(async (expense) => {
        const date = new Date(expense.date);
        const formattedDate = date.toISOString().split("T")[0];

        const truck = await TruckExpense.findById(expense.truckId);
        const registrationNo = truck ? truck.registrationNo : "Unknown";

        return {
          Date: formattedDate,
          "Registration No": registrationNo,
          "Current KM": expense.currentKM,
          Litres: expense.litres,
          Cost: expense.cost,
          Note: expense.note || "",
        };
      })
    );

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Fuel Expenses");

    // Add the merged header row
    worksheet.mergeCells("A1:F1");
    worksheet.getCell("A1").value = `Fuel Expenses ( ${selectedDates[0]} - ${selectedDates[1]} )`;
    worksheet.getCell("A1").font = { bold: true };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black background
    };
    worksheet.getCell("A1").font.color = { argb: "FFFFFF" }; // White font color
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add the headings
    const headings = [
      "Date",
      "Registration No",
      "Current KM",
      "Litres",
      "Cost",
      "Note",
    ];
    worksheet.addRow(headings).font = { bold: true };

    // Add the data
    data.forEach((row) => {
      worksheet.addRow([
        row.Date,
        row["Registration No"],
        row["Current KM"],
        row.Litres,
        row.Cost,
        row.Note,
      ]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

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
    res.status(500).json({ message: "Failed to generate Excel file", error: error.message });
  }
};

module.exports = {
  addFuelExpense,
  getAllFuelExpensesByTruckId,
  deleteFuelExpenseById,
  downloadFuelExpensesExcel,
  getAllFuelExpensesByUserId,
  downloadAllFuelExpensesExcel,
};
