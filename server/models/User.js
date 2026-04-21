/**
 * User Model — with Auth
 * Stores name, email, hashed password, and skills.
 * Skills are loaded automatically after login.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    // Validates format only — checks proper structure like user@domain.tld
    // Does NOT verify the email actually exists (would need a mail service for that)
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address (e.g. you@gmail.com)'
    ]
  },
  passwordHash: {
    type: String,
    required: true,
    select: false  // Never returned in queries by default
  },
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true // adds createdAt, updatedAt
});

// Hash password before saving
// Note: async hooks in Mongoose don't use next() — just return from the async function
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
