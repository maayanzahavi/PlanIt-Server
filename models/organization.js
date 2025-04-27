const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    head: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    domain: {
        type: String,
        required: true,
        unique: true
    }
}, { collection: 'Organizations' });

module.exports = mongoose.model('Organization', OrganizationSchema);
