const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please add a service title'],
        unique: true,
        trim: true
    },
    description: { 
        type: String, 
        required: [true, 'Please add a description'] 
    },
    iconName: { 
        type: String, 
        required: [true, 'Please specify a Lucide icon name'] 
    },
    actionLink: { 
        type: String, 
        default: '/regular/service/request' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);