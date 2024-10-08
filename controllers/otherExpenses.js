const { default: mongoose } = require("mongoose");
const OtherExpense = require("../models/otherExpense-model"); // Adjust the path as needed
const moment = require("moment");
const ExcelJS = require("exceljs");
const TruckExpense = require("../models/truck-model");

const otherNameConversions = {
  toll: "Toll",
  pollution: "Pollution",
  insurance: "Insurance",
  "service&Maintenance": "Service & Maintenance",
  "salary&incentives": "Salary & Incentives",
  other: "Other",
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

    const otherExpenses = await OtherExpense.find(query).sort({ date: 1 });

    if (otherExpenses.length === 0) {
      return res.status(404).json({
        message:
          "No other expenses found for this truck in the given date range",
      });
    }

    const totalExpense = otherExpenses.reduce(
      (sum, expense) => sum + expense.cost,
      0
    );

    const formattedOtherExpenses = otherExpenses.map((expense, index) => {
      // Format the date to 'YYYY-MM-DD'
      // const date = new Date(expense.date);
      // const formattedDate = date.toISOString().split("T")[0];

      const date = new Date(expense.date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      return {
        ...expense.toObject(), // Convert Mongoose document to plain object
        date: formattedDate,
        category:
          expense.category === "other"
            ? expense.other
            : otherNameConversions[expense.category] || "Other",

        key: index,
      };
    });
    res.status(200).json({
      expenses: formattedOtherExpenses,
      totalExpense,
    });
  } catch (error) {
    console.error("Error retrieving other expenses:", error);
    res.status(500).json({ message: "Failed to retrieve other expenses" });
  }
};

const getAllOtherExpensesByUserId = async (req, res) => {
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
        query.date = { $eq: startDate };
      } else {
        // Match the range between startDate and endDate
        query.date = { $gte: startDate, $lte: endDate };
      }
    }

    const otherExpenses = await OtherExpense.find(query).sort({ date: 1 });

    if (otherExpenses.length === 0) {
      return res.status(404).json({
        message:
          "No other expenses found for this user in the given date range",
      });
    }

    // Prepare the other expenses with registration number
    const formattedOtherExpenses = await Promise.all(
      otherExpenses.map(async (expense, index) => {
        const truck = await TruckExpense.findById(expense.truckId);
        const registrationNo = truck ? truck.registrationNo : "Unknown";

        const date = new Date(expense.date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        return {
          ...expense.toObject(), // Convert Mongoose document to plain object
          date: formattedDate,
          registrationNo: registrationNo,
          category:
            expense.category === "other"
              ? expense.other
              : otherNameConversions[expense.category] || "Other",
          key: index,
        };
      })
    );

    const totalExpense = formattedOtherExpenses.reduce(
      (sum, expense) => sum + expense.cost,
      0
    );

    res.status(200).json({
      expenses: formattedOtherExpenses,
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
      return res.status(400).json({ message: "Invalid Expense ID" });
    }

    const deletedTruck = await OtherExpense.findByIdAndDelete(id);

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

const downloadOtherExpensesExcel = async (req, res) => {
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

    // Fetch all other expenses for the given truckId and date range
    const otherExpenses = await OtherExpense.find(query).sort({ date: 1 });
    const truck = await TruckExpense.findById(truckId);

    if (otherExpenses.length === 0) {
      console.log("No expenses found for the given query");
      return res.status(404).json({
        message:
          "No other expenses found for this truck in the given date range",
      });
    }

    // Prepare data for Excel
    const data = otherExpenses.map((expense) => {
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      return {
        Date: formattedDate,
        Category:
          expense.category === "other" ? expense.other : expense.category,
        Cost: expense.cost,
        Note: expense.note || "",
      };
    });

    console.log("Data for Excel:", data);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Other Expenses");

    // Add the merged header row
    worksheet.mergeCells("A1:D1");
    worksheet.getCell(
      "A1"
    ).value = `${truck.registrationNo} - Other Expenses ( ${selectedDates[0]} - ${selectedDates[1]} )`;
    worksheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFF" } }; // White font color
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black background
    };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add the headings
    const headings = ["Date", "Category", "Cost", "Note"];
    worksheet.addRow(headings).font = { bold: true };

    // Add the data
    data.forEach((row) => {
      worksheet.addRow([row.Date, row.Category, row.Cost, row.Note]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for the response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=otherExpenses.xlsx"
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

const downloadAllOtherExpensesExcel = async (req, res) => {
  try {
    const { userId, selectedDates } = req.query;

    if (!userId) {
      console.log("User ID is missing");
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
        query.date = { $eq: startDate };
      } else {
        // Match the range between startDate and endDate
        query.date = { $gte: startDate, $lte: endDate };
      }
    }

    // Fetch all other expenses for the given userId and date range
    const otherExpenses = await OtherExpense.find(query).sort({ date: 1 });

    if (otherExpenses.length === 0) {
      console.log("No expenses found for the given query");
      return res.status(404).json({
        message:
          "No other expenses found for this user in the given date range",
      });
    }

    // Prepare data for Excel with registration numbers
    const data = await Promise.all(
      otherExpenses.map(async (expense) => {
        const truck = await TruckExpense.findById(expense.truckId);
        const registrationNo = truck ? truck.registrationNo : "Unknown";

        const date = new Date(expense.date);
        const formattedDate = date.toISOString().split("T")[0];

        return {
          Date: formattedDate,
          "Registration No": registrationNo,
          Category:
            expense.category === "other" ? expense.other : expense.category,
          Cost: expense.cost,
          Note: expense.note || "",
        };
      })
    );

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Other Expenses");

    // Add the merged header row
    worksheet.mergeCells("A1:E1");
    worksheet.getCell(
      "A1"
    ).value = `Other Expenses ( ${selectedDates[0]} - ${selectedDates[1]} )`;
    worksheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFF" } }; // White font color
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black background
    };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add the headings
    const headings = ["Date", "Registration No", "Category", "Cost", "Note"];
    worksheet.addRow(headings).font = { bold: true };

    // Add the data
    data.forEach((row) => {
      worksheet.addRow([
        row.Date,
        row["Registration No"],
        row.Category,
        row.Cost,
        row.Note,
      ]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for the response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=otherExpenses.xlsx"
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
  addOtherExpense,
  getAllOtherExpensesByTruckId,
  getAllOtherExpensesByUserId,
  deleteOtherExpenseById,
  downloadOtherExpensesExcel,
  downloadAllOtherExpensesExcel,
};
