const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({

  phone: {
    type: String,
    required: [true, 'is required'],
    unique: [true, 'Phone already in use'],
    trim: true
  },
  account_type: {
    type: String,
    required: [true, 'is required'],
    enum: ["user","admin","donee"]
  },
  profile_completion: {
    type: Number,
    default: 0
  },
  device: {
    type: Array
  },
  is_blocked: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  },
  current_delivery_agent_number: {
    type: Number,
    default: 0
  }
})

var ID = function () {
  return Math.random().toString(36).substring(2, 9);
};

userSchema.pre('save', async function save(next) {
  this.increment();
  this.updated_at = new Date;
  return next();
});

userSchema.index({geojson:"2dsphere"});

module.exports = mongoose.model('Users', userSchema)