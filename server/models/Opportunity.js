/**
 * Opportunity Model
 * Defines the schema for internships and hackathons.
 * Extended with caching metadata, deadline tracking, and rich detail fields.
 */

const mongoose = require('mongoose');

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
  requiredSkills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  optionalSkills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  applyUrl: {
    type: String,
    default: '#',
    trim: true
  },
  source: {
    type: String,
    enum: ['devpost', 'remotive', 'mlh', 'manual', 'fallback'],
    default: 'manual'
  },
  description: {
    type: String,
    default: ''
  },
  // Location info (Remote / City / Country)
  location: {
    type: String,
    default: 'Remote'
  },
  // Prize pool for hackathons, stipend for internships
  prizePool: {
    type: String,
    default: ''
  },
  // Application deadline (optional — used to filter out expired listings)
  deadline: {
    type: Date,
    default: null
  },
  // Whether this listing is still active/visible to users
  isActive: {
    type: Boolean,
    default: true
  },
  // When data was last fetched from external API — used for cache TTL
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for full-text search on title and description
opportunitySchema.index(
  { title: 'text', description: 'text', company: 'text' },
  { weights: { title: 3, company: 2, description: 1 } }
);

// Regular index for fast skill-based queries
opportunitySchema.index({ requiredSkills: 1 });
opportunitySchema.index({ type: 1, isActive: 1 });
opportunitySchema.index({ source: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
