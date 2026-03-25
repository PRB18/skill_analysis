/**
 * Opportunity Model
 * Defines the schema for internships and hackathons
 * Opportunities have required and optional skills for matching
 */

const mongoose = require('mongoose');

/**
 * Opportunity Schema Definition
 * @property {String} title - Job/hackathon title
 * @property {String} company - Company or organization name
 * @property {String} type - Type of opportunity: 'internship' or 'hackathon'
 * @property {[String]} requiredSkills - Skills that are mandatory for the role
 * @property {[String]} optionalSkills - Skills that are nice-to-have but not required
 * @property {Date} createdAt - Timestamp when opportunity was created
 */
const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['internship', 'hackathon'],
      message: 'Type must be either internship or hackathon'
    }
  },
  requiredSkills: {
    type: [String],
    default: [],
    // Normalize skills to lowercase for consistent matching
    set: function(skills) {
      return skills.map(skill => skill.toLowerCase().trim());
    }
  },
  optionalSkills: {
    type: [String],
    default: [],
    // Normalize skills to lowercase for consistent matching
    set: function(skills) {
      return skills.map(skill => skill.toLowerCase().trim());
    }
  },
  applyUrl: {
    type: String,
    default: '#',
    trim: true
  },
  source: {
    type: String,
    enum: ['internshala', 'github', 'devpost', 'linkedin', 'manual'],
    default: 'manual'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Create and export the Opportunity model
 * Collection name in MongoDB will be 'opportunities'
 */
module.exports = mongoose.model('Opportunity', opportunitySchema);
