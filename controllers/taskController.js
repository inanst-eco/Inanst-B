const Task = require('../models/Task');

//  Create Task 
exports.createTask = async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            adminId: req.user._id 
        });
        await task.save();
        res.status(201).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

//  Get All Tasks 
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//  Get My Tasks 
exports.getMyTasks = async (req, res) => {
    try {
       
        const tasks = await Task.find({ workerId: req.params.staffId }).sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId, status } = req.body;
        const task = await Task.findByIdAndUpdate(
            taskId, 
            { status }, 
            { new: true }
        );
        res.json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Task removed from system" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};