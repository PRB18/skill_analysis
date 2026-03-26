/**
 * User Model
 * Defines the schema for users who want to find matching opportunities
 * Users have a name and an array of skills they possess
 */

const mongoose = require('mongoose');

/**
 * User Schema Definition
 * @property {String} name - Full name of the user
 * @property {[String]} skills - Array of skills the user possesses (e.g., ["React", "Node.js", "Python"])
 * @property {Date} createdAt - Timestamp when user was created
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Create and export the User model
 * Collection name in MongoDB will be 'users'
 */
module.exports = mongoose.model('User', userSchema);
