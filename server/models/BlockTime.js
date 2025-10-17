const mongoose = require('mongoose');

const BlockTimeSchema = new mongoose.Schema({
    practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    reason: { type: String, default: 'Blocked' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin/practitioner who created the block
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlockTime', BlockTimeSchema);
