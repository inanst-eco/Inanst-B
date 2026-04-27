const Service = require('../models/Service');


exports.getServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            count: services.length, 
            data: services 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        await service.deleteOne();
        res.status(200).json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};