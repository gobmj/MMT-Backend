const mongoose = require('mongoose');

const FuelFillingSchema = new mongoose.Schema({
    truckId: {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'Truck',
        required: [true, "Truck ID is required"],
    },
    date: {
        type: Date,
        required: [true, "Date of fuel filling is required"],
    },
    currentKM: {
        type: Number,
        required: [true, "Current kilometers is required"],
    },
    litres: {
        type: Number,
        required: [true, "Amount of fuel filled is required"],
    },
    cost: {
        type: Number,
        required: [true, "Cost of the fuel is required"],
    },
    note: {
        type: String,
        required: [true, "Note is required"],
    }
});

module.exports = mongoose.model('FuelFilling', FuelFillingSchema);
