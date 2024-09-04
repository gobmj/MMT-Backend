const { default: mongoose } = require("mongoose");
const FuelExpense = require("../models/fuelExpense-model");
const DefExpense = require("../models/defExpense-model"); 
const OtherExpense = require("../models/otherExpense-model");
const moment = require("moment");

const getAllTotalExpensesByUserId = async (req, res) => {
    try {
      const { userId, selectedDates } = req.query;
  
      if (!userId) {
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
  
      // Fetch all expenses and add catalog type
      const fuelExpenses = (await FuelExpense.find(query).sort({ date: 1 })).map(expense => ({
        ...expense.toObject(),
        catalog: 'Fuel Expense',
      }));
  
      const defExpenses = (await DefExpense.find(query).sort({ date: 1 })).map(expense => ({
        ...expense.toObject(),
        catalog: 'Def Expense',
      }));
  
      const otherExpenses = (await OtherExpense.find(query).sort({ date: 1 })).map(expense => ({
        ...expense.toObject(),
        catalog: 'Other Expense',
      }));
  
      // Combine all expenses
      const allExpenses = [...fuelExpenses, ...defExpenses, ...otherExpenses];
  
      if (allExpenses.length === 0) {
        return res.status(404).json({
          message: "No expenses found for this user in the given date range",
        });
      }
  
      const totalExpense = allExpenses.reduce(
        (sum, expense) => sum + expense.cost,
        0
      );
  
      // Sort combined expenses by date
      allExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Format the expenses
      const formattedExpenses = allExpenses.map((expense, index) => {
        const date = new Date(expense.date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
  
        return {
          ...expense,
          date: formattedDate,
          key: index,
        };
      });
  
      res.status(200).json({
        expenses: formattedExpenses,
        totalExpense,
      });
    } catch (error) {
      console.error("Error retrieving expenses:", error);
      res.status(500).json({ message: "Failed to retrieve expenses" });
    }
  };
  

module.exports = {
  getAllTotalExpensesByUserId,
};
