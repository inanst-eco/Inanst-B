const School = require('../models/School');

// Fetch all schools for the enrollment page
exports.getSchools = async (req, res) => {
    try {
        const schools = await School.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: schools });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a new school from the Admin "Add School" page
exports.addSchool = async (req, res) => {
    try {
        const newSchool = await School.create(req.body);
        res.status(201).json({ success: true, data: newSchool });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a school using its ID
exports.deleteSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSchool = await School.findByIdAndDelete(id);
        
        if (!deletedSchool) {
            return res.status(404).json({ success: false, message: "School not found" });
        }
        
        res.status(200).json({ success: true, message: "School deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};