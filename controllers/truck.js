const { default: mongoose } = require('mongoose');
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

const getTruckById = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the request parameters

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid truck ID' });
        }

        // Find the truck by ID
        const truck = await Truck.findById(id);

        if (!truck) {
            return res.status(404).json({ message: 'Truck not found' });
        }

        res.status(200).json(truck);
    } catch (error) {
        console.error('Error fetching truck by ID:', error);
        res.status(500).json({ message: 'Failed to fetch truck', error: error.message });
    }
};

const getAllTrucks = async (req, res) => {
    try {
        const trucks = await Truck.find();

        res.status(200).json(trucks);
    } catch (error) {
        console.error('Error fetching trucks:', error);
        res.status(500).json({ message: 'Failed to fetch trucks', error: error.message });
    }
};

const updateTruck = async (req, res) => {
    try {
        const { id } = req.params;
        const { registrationNo, make, model, year, imgURL, chassisNo, engineNo, desc } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid truck ID' });
        }

        const updatedTruck = await Truck.findByIdAndUpdate(id, {
            registrationNo,
            make,
            model,
            year,
            imgURL,
            chassisNo,
            engineNo,
            desc,
        }, { new: true });

        res.status(200).json(updatedTruck);
    } catch (error) {
        console.error('Error updating truck:', error);
        res.status(500).json({ message: 'Failed to update truck', error: error.message });
    }
}

const deleteTruckById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid truck ID' });
        }

        await Truck.findByIdAndDelete(id);

        res.status(204).end();
    } catch (error) {
        console.error('Error deleting truck:', error);
        res.status(500).json({ message: 'Failed to delete truck', error: error.message });
    }
}

module.exports = {
    addTruck,
    getTruckById,
    getAllTrucks,
    updateTruck,
    deleteTruckById,
};
