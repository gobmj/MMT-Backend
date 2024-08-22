const Truck = require('../models/truck-model'); // Adjust the path as needed

const addTruck = async (req, res) => {
    try {
        const { userId, registrationNo, make, model, year, imgURL, chassisNo, engineNo, desc } = req.body;

        const newTruck = new Truck({
            userId,
            registrationNo,
            make,
            model,
            year,
            imgURL,
            chassisNo,
            engineNo,
            desc,
        });

        const savedTruck = await newTruck.save();
        res.status(201).json(savedTruck);
    } catch (error) {
        console.error('Error adding truck:', error); // Log the full error
        res.status(500).json({ message: 'Failed to add truck', error: error.message });
    }
};

module.exports = {
    addTruck,
};
