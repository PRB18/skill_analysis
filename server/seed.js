/**
 * Database Seeder
 * Populates MongoDB with initial sample opportunities for testing
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Opportunity = require('./models/Opportunity');

// Load environment variables
dotenv.config();

/**
 * Sample opportunities data
 * Includes internships and hackathons with required and optional skills
 */
const opportunitiesData = [
  {
    title: 'Frontend Developer Intern',
    company: 'Infosys',
    type: 'internship',
    requiredSkills: ['React', 'JavaScript', 'CSS'],
    optionalSkills: ['TypeScript', 'Redux']
  },
  {
    title: 'Backend Developer Intern',
    company: 'Cognizant',
    type: 'internship',
    requiredSkills: ['Node.js', 'MongoDB', 'Express'],
    optionalSkills: ['Docker', 'AWS']
  },
  {
    title: 'ML Hackathon',
    company: 'Google',
    type: 'hackathon',
    requiredSkills: ['Python', 'TensorFlow', 'Pandas'],
    optionalSkills: ['PyTorch', 'Scikit-learn']
  },
  {
    title: 'Full Stack Intern',
    company: 'TCS',
    type: 'internship',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
    optionalSkills: ['Redux', 'Docker']
  },
  {
    title: 'Data Science Intern',
    company: 'Wipro',
    type: 'internship',
    requiredSkills: ['Python', 'Pandas', 'SQL'],
    optionalSkills: ['Tableau', 'PowerBI']
  }
];

/**
 * Seed Database Function
 * Clears existing opportunities and inserts new data
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing opportunities
    await Opportunity.deleteMany({});
    console.log('🗑️  Cleared existing opportunities');

    // Insert new opportunities
    const inserted = await Opportunity.insertMany(opportunitiesData);
    console.log(`✅ Inserted ${inserted.length} opportunities`);

    // Log inserted opportunities
    inserted.forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title} at ${opp.company}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
