// models/OtherExpense.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema
const otherExpenseSchema = new Schema({
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
  category: {
    type: String,
    required: [true, "Please select a category"],
  },
  cost: {
    type: Number,
    required: [true, "Please enter the cost"],
  },
  note: {
    type: String,
    trim: true,
  },
});

// Create the model
const OtherExpense = mongoose.model("OtherExpense", otherExpenseSchema);

module.exports = OtherExpense;
