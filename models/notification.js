const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { collection: 'Notifications' });

module.exports = mongoose.model('Notification', NotificationSchema);
