const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['organization_head', 'manager', 'team_member'],
    required: true
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  skills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    default: []
  }],
  preferences: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    default: []
  },
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project',
    default: []
  }],
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
    default: []
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'Notification',
    default: []
  }]
}, { collection: 'Users' });

module.exports = mongoose.model('User', UserSchema);
