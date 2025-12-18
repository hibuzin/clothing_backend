const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'SERVER_START'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);
