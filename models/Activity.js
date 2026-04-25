const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'worker', 'instructor'] },
    action: { type: String }, 
    metadata: { 
        cardName: String, 
        duration: Number,
        targetId: String  
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);