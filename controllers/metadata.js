const FuelExpense = require('../models/fuelExpense-model');
const DefExpense = require('../models/defExpense-model');
const Truck = require('../models/truck-model');
const OtherExpense = require('../models/otherExpense-model');
const { default: mongoose } = require('mongoose');

const getMetadataByTruckId = async (req, res) => {
    const { truckId } = req.query;
    

    if (!mongoose.Types.ObjectId.isValid(truckId)) {
        return res.status(400).json({ error: 'Invalid truck ID' });
    }

    try {
        // Calculate total fuel expenses
        const fuelResult = await FuelExpense.aggregate([
            { $match: { truckId: truckId } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const fuelTotal = fuelResult.length > 0 ? fuelResult[0].totalCost : 0;

        // Calculate total DEF expenses
        const defResult = await DefExpense.aggregate([
            { $match: { truckId: truckId } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const defTotal = defResult.length > 0 ? defResult[0].totalCost : 0;

        // Calculate total other expenses
        const otherResult = await OtherExpense.aggregate([
            { $match: { truckId: truckId } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const otherTotal = otherResult.length > 0 ? otherResult[0].totalCost : 0;

        // Combine results
        const totalExpenses = {
            fuelTotal,
            defTotal,
            otherTotal,
            grandTotal: fuelTotal + defTotal + otherTotal
        };

        return res.json(totalExpenses);
    } catch (error) {
        console.error("Error calculating total expenses:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getMetadataByUserId = async (req, res) => {
    const { userId } = req.query;
    

    // if (!mongoose.Types.ObjectId.isValid(userId)) {
        if (!userId) {
        return res.status(400).json({ error: 'Invalid User ID' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
        // Total fuel expenses
        const fuelResult = await FuelExpense.aggregate([
            { $match: { addedBy: userId } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const fuelTotal = fuelResult.length > 0 ? fuelResult[0].totalCost : 0;

        // Total DEF expenses
        const defResult = await DefExpense.aggregate([
            { $match: { addedBy: userId } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const defTotal = defResult.length > 0 ? defResult[0].totalCost : 0;

        // Total other expenses
        const otherResult = await OtherExpense.aggregate([
            { $match: { addedBy: userId } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const otherTotal = otherResult.length > 0 ? otherResult[0].totalCost : 0;

        // Total fuel used
        const fuelUsedResult = await FuelExpense.aggregate([
            { $match: { addedBy: userId } },
            { $group: { _id: null, totalCost: { $sum: "$litres" } } }
        ]);

        const fuelUsedTotal = fuelUsedResult.length > 0 ? fuelUsedResult[0].totalCost : 0;

        // Monthly fuel expenses
        const fuelMonthlyResult = await FuelExpense.aggregate([
            { $match: { addedBy: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const fuelMonthlyTotal = fuelMonthlyResult.length > 0 ? fuelMonthlyResult[0].totalCost : 0;

        // Monthly DEF expenses
        const defMonthlyResult = await DefExpense.aggregate([
            { $match: { addedBy: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const defMonthlyTotal = defMonthlyResult.length > 0 ? defMonthlyResult[0].totalCost : 0;

        // Monthly other expenses
        const otherMonthlyResult = await OtherExpense.aggregate([
            { $match: { addedBy: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalCost: { $sum: "$cost" } } }
        ]);

        const otherMonthlyTotal = otherMonthlyResult.length > 0 ? otherMonthlyResult[0].totalCost : 0;

        // Monthly fuel used
        const fuelUsedMonthlyResult = await FuelExpense.aggregate([
            { $match: { addedBy: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalCost: { $sum: "$litres" } } }
        ]);

        const fuelUsedMonthlyTotal = fuelUsedMonthlyResult.length > 0 ? fuelUsedMonthlyResult[0].totalCost : 0;

        // Combine results
        const totalExpenses = {
            fuelTotal,
            defTotal,
            otherTotal,
            fuelUsedTotal,
            grandTotal: fuelTotal + defTotal + otherTotal,
            monthlyExpenses: {
                fuel: fuelMonthlyTotal,
                def: defMonthlyTotal,
                other: otherMonthlyTotal,
                fuelUsed: fuelUsedMonthlyTotal,
                monthlyGrandTotal: fuelMonthlyTotal + defMonthlyTotal + otherMonthlyTotal
            }
        };

        return res.json(totalExpenses);
    } catch (error) {
        console.error("Error calculating total expenses:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getProfileMetadataByUserId = async(req,res)=>{
    const {userId} = req.query;

    try {
        // Step 1: Calculate total kilometers from FuelExpense collection
        const kmResult = await FuelExpense.aggregate([
            { $match: { addedBy: userId } }, // Match records for the specific user
            { $sort: { truckId: 1, date: -1 } }, // Sort by truckId and date in descending order

            // Group by truckId to find the latest currentKM
            {
                $group: {
                    _id: "$truckId",
                    latestKM: { $first: "$currentKM" } // Get the latest currentKM (most recent entry)
                }
            },

            // Group all records together to calculate total kilometers
            {
                $group: {
                    _id: null, // Group all records into one group
                    totalKM: { $sum: "$latestKM" } // Sum the latestKM values
                }
            },

            // Format the output
            {
                $project: {
                    _id: 0, // Exclude _id from the output
                    totalKM: 1 // Include totalKM in the output
                }
            }
        ]);

        // Step 2: Calculate total number of trucks from Truck collection
        const truckCount = await Truck.countDocuments({ addedBy: userId });

        // Combine results
        const result = {
            totalKM: kmResult.length > 0 ? kmResult[0].totalKM : 0,
            totalTrucks: truckCount
        };

        res.json(result);
    } catch (error) {
        console.error('Error retrieving total kilometers and total trucks:', error);
        res.status(500).json({ error: 'An error occurred while retrieving total kilometers and total trucks.' });
    }
}

module.exports = {
    getMetadataByTruckId,
    getMetadataByUserId,
    getProfileMetadataByUserId
};
