const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"],
    },
    registrationNo: {
        type: String,
        required: [true, "Truck registration number is required"],
    },
    make: {
        type: String,
        required: [true, "Truck make is required"],
    },
    model: {
        type: String,
        required: [true, "Truck model is required"],
    },
    year: {
        type: Number,
        required: [true, "Year of manufacture is required"],
    },
    imgURL: {
        type: String,
        required: [true, "Image URL is required"],
    },
    chassisNo: {
        type: String,
        required: [true, "Chassis number is required"],
    },
    engineNo: {
        type: String,
        required: [true, "Engine number is required"],
    },
    desc: {
        type: String,
        required: [true, "Description is required"],
    }
});

module.exports = mongoose.model('Truck', TruckSchema);
