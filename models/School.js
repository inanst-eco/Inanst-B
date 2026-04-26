const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true }, 
    iconName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);