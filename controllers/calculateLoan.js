const { default: mongoose } = require("mongoose");
const LoanCalculation = require("../models/calculateLoan-model");
const moment = require("moment");
const ExcelJS = require("exceljs");
const Truck = require("../models/truck-model");

// Controller to add a new loan filling record
const addLoanCalculation = async (req, res) => {
  try {
    const { truckId, addedBy, date, cost, additionalCharges, note } = req.body;

    const newLoanCalculation = new LoanCalculation({
      truckId,
      addedBy,
      date,
      cost,
      additionalCharges,
      note,
    });

    const savedLoanCalculation = await newLoanCalculation.save();
    res.status(201).json(savedLoanCalculation);
  } catch (error) {
    console.error("Error adding loan filling:", error);
    res.status(500).json({ message: "Failed to add loan filling" });
  }
};

const getAllLoanCalculationsByTruckId = async (req, res) => {
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

    // Fetch all loan calculations for the given truckId and date range
    const loanCalculations = await LoanCalculation.find(query).sort({
      date: 1,
    });

    // if (loanCalculations.length === 0) {
    //   return res.status(404).json({
    //     message:
    //       "No loan calculations found for this truck in the given date range",
    //   });
    // }

    const totalCalculation = loanCalculations.reduce(
      (sum, calculation) => sum + calculation.cost,
      0
    );
    // Fetch total finance amount for the truck
    const truck = await Truck.findOne({ _id: truckId });

    const totalFinanceAmount = truck ? truck.financeAmount : 0;

    // Fetch recent payment
    const recentPayment = await LoanCalculation.findOne({ truckId }).sort({
      createdAt: -1,
    }); // Get the latest payment

    // Calculate payment left
    const totalPaid = await LoanCalculation.aggregate([
      { $match: { truckId } },
      { $group: { _id: null, totalPaid: { $sum: "$cost" } } },
    ]);

    const totalPaidAmount = totalPaid.length > 0 ? totalPaid[0].totalPaid : 0;

    // Calculate total additional charges
    const additionalChargesResult = await LoanCalculation.aggregate([
      { $match: { truckId } },
      {
        $group: {
          _id: null,
          totalAdditionalCharges: { $sum: "$additionalCharges" },
        },
      },
    ]);

    const totalAdditionalCharges =
      additionalChargesResult.length > 0
        ? additionalChargesResult[0].totalAdditionalCharges
        : 0;

    const paymentLeft = (totalFinanceAmount + totalAdditionalCharges) - totalPaidAmount;

    console.log(totalFinanceAmount, totalAdditionalCharges, totalPaidAmount, paymentLeft);
    

    // Format loan calculations
    const formattedLoanCalculations = loanCalculations.map(
      (calculation, index) => {
        const date = new Date(calculation.date);
        const formattedDate = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'

        return {
          ...calculation.toObject(),
          date: formattedDate,
          key: index,
        };
      }
    );

    res.status(200).json({
      calculations: formattedLoanCalculations,
      totalCalculation,
      totalFinanceAmount,
      recentPayment,
      paymentLeft,
      totalAdditionalCharges,
    });
  } catch (error) {
    console.error("Error retrieving loan calculations:", error);
    res.status(500).json({ message: "Failed to retrieve loan calculations" });
  }
};

const getAllLoanCalculationsByUserId = async (req, res) => {
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

    // Fetch all loan calculations for the given userId and date range
    const loanCalculations = await LoanCalculation.find(query).sort({
      date: 1,
    });

    if (loanCalculations.length === 0) {
      return res.status(404).json({
        message:
          "No loan calculations found for this user in the given date range",
      });
    }

    // Find registration numbers for each truckId in the loan calculations
    const formattedLoanCalculations = await Promise.all(
      loanCalculations.map(async (calculation, index) => {
        const truck = await Truck.findById(calculation.truckId);
        const registrationNo = truck ? truck.registrationNo : "Unknown";

        const date = new Date(calculation.date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        return {
          ...calculation.toObject(),
          date: formattedDate,
          registrationNo,
          key: index,
        };
      })
    );

    const totalCalculation = loanCalculations.reduce(
      (sum, calculation) => sum + calculation.cost,
      0
    );

    res.status(200).json({
      calculations: formattedLoanCalculations,
      totalCalculation,
    });
  } catch (error) {
    console.error("Error retrieving loan calculations:", error);
    res.status(500).json({ message: "Failed to retrieve loan calculations" });
  }
};

const deleteLoanCalculationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Calculation ID" });
    }

    const deletedTruck = await LoanCalculation.findByIdAndDelete(id);

    if (!deletedTruck) {
      return res.status(404).json({ message: "Calculation not found" });
    }

    res.status(200).json({ message: "Calculation deleted" });
  } catch (error) {
    console.error("Error deleting truck:", error);
    res
      .status(500)
      .json({ message: "Failed to delete Calculation", error: error.message });
  }
};

const downloadLoanCalculationsExcel = async (req, res) => {
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

    // Fetch all loan calculations for the given truckId and date range
    const loanCalculations = await LoanCalculation.find(query).sort({
      date: 1,
    });
    const truck = await Truck.findById(truckId);

    if (loanCalculations.length === 0) {
      console.log("No calculations found for the given query");
      return res.status(404).json({
        message:
          "No loan calculations found for this truck in the given date range",
      });
    }

    // Prepare data for Excel
    const data = loanCalculations.map((calculation, index) => {
      const date = new Date(calculation.date);
      const formattedDate = date.toISOString().split("T")[0];

      const range =
        index > 0
          ? calculation.currentKM - loanCalculations[index - 1].currentKM
          : 0;

      const mileage = range > 0 ? (range / calculation.litres).toFixed(2) : 0;

      return {
        Date: formattedDate,
        Cost: calculation.cost,
        AdditionalCharges: calculation.additionalCharges || 0,
        Note: calculation.note || "",
      };
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Loan Calculations");

    // Add the merged header row
    worksheet.mergeCells("A1:D1");
    worksheet.getCell(
      "A1"
    ).value = `${truck.registrationNo} - Loan Calculations ( ${selectedDates[0]} - ${selectedDates[1]} )`;
    worksheet.getCell("A1").font = { bold: true };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black background
    };
    worksheet.getCell("A1").font.color = { argb: "FFFFFF" }; // White font color
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add the headings
    const headings = ["Date", "Cost","Additional Charges", "Note"];
    worksheet.addRow(headings).font = { bold: true };

    // Add the data
    data.forEach((row) => {
      worksheet.addRow([row.Date, row.Cost, row.AdditionalCharges, row.Note]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for the response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=loanCalculations.xlsx"
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

const downloadAllLoanCalculationsExcel = async (req, res) => {
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

    const loanCalculations = await LoanCalculation.find(query).sort({
      date: 1,
    });

    if (loanCalculations.length === 0) {
      console.log("No calculations found for the given query");
      return res.status(404).json({
        message:
          "No loan calculations found for this user in the given date range",
      });
    }

    // Prepare data for Excel with registration number
    const data = await Promise.all(
      loanCalculations.map(async (calculation) => {
        const date = new Date(calculation.date);
        const formattedDate = date.toISOString().split("T")[0];

        const truck = await Truck.findById(calculation.truckId);
        const registrationNo = truck ? truck.registrationNo : "Unknown";

        return {
          Date: formattedDate,
          "Registration No": registrationNo,
          Cost: calculation.cost,
          Note: calculation.note || "",
        };
      })
    );

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Loan Calculations");

    // Add the merged header row
    worksheet.mergeCells("A1:F1");
    worksheet.getCell(
      "A1"
    ).value = `Loan Calculations ( ${selectedDates[0]} - ${selectedDates[1]} )`;
    worksheet.getCell("A1").font = { bold: true };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black background
    };
    worksheet.getCell("A1").font.color = { argb: "FFFFFF" }; // White font color
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Add the headings
    const headings = ["Date", "Registration No", "Cost", "Note"];
    worksheet.addRow(headings).font = { bold: true };

    // Add the data
    data.forEach((row) => {
      worksheet.addRow([row.Date, row["Registration No"], row.Cost, row.Note]);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for the response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=loanCalculations.xlsx"
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
  addLoanCalculation,
  getAllLoanCalculationsByTruckId,
  deleteLoanCalculationById,
  downloadLoanCalculationsExcel,
  getAllLoanCalculationsByUserId,
  downloadAllLoanCalculationsExcel,
};
