const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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
  profilePic: {
    type: String, 
    default: ""   
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
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
  preferences: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    default: []
  }] ,
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
