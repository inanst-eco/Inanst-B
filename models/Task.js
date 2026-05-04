const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    workerId: { type: String, required: true }, 
    position: { type: String, required: true },
    duration: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Processing', 'Processed'], 
        default: 'Processing' 
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);