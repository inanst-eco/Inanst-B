const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    portfolio: { type: String, required: true },
    roleTitle: { type: String, required: true }, 
    reason: { type: String, required: true },
    status: { 
        type: String, 
       
        enum: ['pending', 'accepted', 'denied', 'ended'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Internship', InternshipSchema);