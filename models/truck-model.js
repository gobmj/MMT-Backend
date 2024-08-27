const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema({
    userId: {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'User',
        required: [true, "User ID is required"],
    },
    registrationNo: {
        type: String,
        required: [true, "Truck registration number is required"],
    },
    createdAt: {
        type: Date,
        default: () => new Date(), // Use a function to get the current date and time
      },
    make: {
        type: String,
    },
    model: {
        type: String,
    },
    year: {
        type: Number,
    },
    imgURL: {
        type: Array,
    },
    chassisNo: {
        type: String,
    },
    engineNo: {
        type: String,
    },
    desc: {
        type: String,
    }
});

module.exports = mongoose.model('Truck', TruckSchema);
