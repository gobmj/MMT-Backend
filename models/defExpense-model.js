// models/DefExpense.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const defExpenseSchema = new Schema({
  truckId: {
    // type: mongoose.Schema.Types.ObjectId,
    type: String,
    ref: "Truck",
    required: [true, "Truck ID is required"],
  },
  date: {
    type: Date,
    required: [true, "Please choose the date"],
  },
  createdAt: {
    type: Date,
    default: () => new Date(), // Use a function to get the current date and time
  },
  currentKM: {
    type: Number,
    required: [true, "Please enter the current KM"],
  },
  litres: {
    type: Number,
    required: [true, "Please enter the litres of def filled"],
  },
  cost: {
    type: Number,
    required: [true, "Please enter the cost of def"],
  },
  note: {
    type: String,
    trim: true,
  },
});

const DefExpense = mongoose.model("DefExpense", defExpenseSchema);

module.exports = DefExpense;
