const mongoose = require('mongoose');


const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    status: { type: String, default: 'active' }
});

module.exports = mongoose.model('Student', studentSchema);
