const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please add a school title'],
        unique: true,
        trim: true
    },
    description: { 
        type: String, 
        required: [true, 'Please add a description'] 
    },
    iconName: { 
        type: String, 
        required: [true, 'Please specify a Lucide icon name'],
        default: 'GraduationCap'
    },
    slug: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


module.exports = mongoose.models.School || mongoose.model('School', SchoolSchema);