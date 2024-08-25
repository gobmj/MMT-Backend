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
