const { default: mongoose } = require("mongoose");
const DefExpense = require("../models/defExpense-model");
const moment = require("moment");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');

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

// const downloadDefExpensesExcel = async (req, res) => {
//   try {
//     const { truckId, selectedDates } = req.query;

//     if (!truckId) {
//       console.log("Truck ID is missing");
//       return res.status(400).json({ message: "Truck ID is required" });
//     }

//     // Ensure the dates are in UTC and set the time to 00:00:00 to avoid time zone issues
//     const startDate = selectedDates
//       ? moment.utc(selectedDates[0]).startOf("day").toDate()
//       : null;
//     const endDate = selectedDates
//       ? moment.utc(selectedDates[1]).endOf("day").toDate()
//       : null;

//     console.log("Start Date:", startDate);
//     console.log("End Date:", endDate);

//     // Build the query filter
//     const query = { truckId };

//     if (startDate && endDate) {
//       if (startDate.toDateString() === endDate.toDateString()) {
//         // If startDate and endDate are the same, match that specific date
//         query.date = { $eq: startDate };
//       } else {
//         // Match the range between startDate and endDate
//         query.date = { $gte: startDate, $lte: endDate };
//       }
//     }

//     console.log("Query:", query);

//     // Fetch all def expenses for the given truckId and date range
//     const defExpenses = await DefExpense.find(query).sort({ date: 1 });

//     if (defExpenses.length === 0) {
//       console.log("No expenses found for the given query");
//       return res.status(404).json({
//         message: "No def expenses found for this truck in the given date range",
//       });
//     }

//     // Prepare data for Excel
//     const data = defExpenses.map((expense, index) => {
//       const date = new Date(expense.date);
//       const formattedDate = date.toISOString().split("T")[0];

//       const range =
//         index > 0 ? expense.currentKM - defExpenses[index - 1].currentKM : 0;

//       return {
//         Date: formattedDate,
//         "Truck ID": expense.truckId,
//         "Added By": expense.addedBy,
//         "Current KM": expense.currentKM,
//         Litres: expense.litres,
//         Cost: expense.cost,
//         Note: expense.note || "",
//         Range: range,
//       };
//     });

//     console.log("Data for Excel:", data);

//     // Create a new workbook and worksheet
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(data);
//     XLSX.utils.book_append_sheet(wb, ws, "Def Expenses");

//     // Generate a unique filename
//     const uniqueId = uuidv4();
//     const fileName = `defExpenses_${uniqueId}.xlsx`;
//     const filePath = path.join(__dirname, 'uploads', fileName);

//     // Ensure the uploads directory exists
//     if (!fs.existsSync(path.dirname(filePath))) {
//       fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     }

//     // Write Excel file to the specified path
//     XLSX.writeFile(wb, filePath);

//     console.log("Excel file created at:", filePath);

//     // Construct the public URL or path to the file
//     const publicUrl = `https://managemytruck.me/uploads/${fileName}`;

//     // Respond with the URL to download the file
//     res.status(200).json({ fileUrl: publicUrl });
//   } catch (error) {
//     console.error("Error generating Excel file:", error);
//     res.status(500).json({ message: "Failed to generate Excel file", error: error.message });
//   }
// };

const downloadDefExpensesExcel = async (req, res) => {
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
    const defExpenses = await DefExpense.find(query).sort({ date: 1 });

    if (defExpenses.length === 0) {
      console.log("No expenses found for the given query");
      return res.status(404).json({
        message: "No def expenses found for this truck in the given date range",
      });
    }

    // Prepare data for Excel
    const data = defExpenses.map((expense, index) => {
      const date = new Date(expense.date);
      const formattedDate = date.toISOString().split("T")[0];

      const range =
        index > 0 ? expense.currentKM - defExpenses[index - 1].currentKM : 0;

      return {
        Date: formattedDate,
        "Truck ID": expense.truckId,
        "Added By": expense.addedBy,
        "Current KM": expense.currentKM,
        Litres: expense.litres,
        Cost: expense.cost,
        Note: expense.note || "",
        Range: range,
      };
    });

    console.log("Data for Excel:", data);

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Def Expenses");

    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileName = `defExpenses_${uniqueId}.xlsx`;
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Ensure the uploads directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Write Excel file to the specified path
    XLSX.writeFile(wb, filePath);

    console.log("Excel file created at:", filePath);

    // Send the file as a download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading the file:", err);
        res.status(500).json({ message: "Failed to download Excel file", error: err.message });
      } else {
        // Optionally, delete the file after download to save space
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting the file:", unlinkErr);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Failed to generate Excel file", error: error.message });
  }
};


module.exports = {
  addDefExpense,
  getAllDefExpensesByTruckId,
  deleteDefExpenseById,
  downloadDefExpensesExcel
};
