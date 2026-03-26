/**
 * Mock Opportunities Data
 * Used as fallback when database is empty/unavailable
 */
const mockOpportunities = [
  {
    _id: '1',
    title: 'Frontend Developer',
    company: 'Tech Startup Inc',
    type: 'internship',
    description: 'Build modern web applications with React',
    requiredSkills: ['react', 'javascript', 'css'],
    optionalSkills: ['typescript', 'redux', 'testing'],
    applyUrl: 'https://www.internshala.com/internships',
    source: 'internshala'
  },
  {
    _id: '2',
    title: 'Full Stack Engineer',
    company: 'Web Solutions Co',
    type: 'internship',
    description: 'Work on both frontend and backend systems',
    requiredSkills: ['javascript', 'node.js', 'mongodb'],
    optionalSkills: ['react', 'docker', 'aws'],
    applyUrl: 'https://www.internshala.com/internships',
    source: 'internshala'
  },
  {
    _id: '3',
    title: 'Backend Developer',
    company: 'Cloud Systems Ltd',
    type: 'hackathon',
    description: 'Develop scalable server applications',
    requiredSkills: ['node.js', 'python', 'sql'],
    optionalSkills: ['docker', 'kubernetes', 'graphql'],
    applyUrl: 'https://devpost.com/hackathons',
    source: 'devpost'
  },
  {
    _id: '4',
    title: 'Data Scientist',
    company: 'AI Innovations',
    type: 'hackathon',
    description: 'Analyze data and build ML models',
    requiredSkills: ['python', 'statistics', 'machine learning'],
    optionalSkills: ['tensorflow', 'sql', 'spark'],
    applyUrl: 'https://devpost.com/hackathons',
    source: 'devpost'
  },
  {
    _id: '5',
    title: 'DevOps Engineer',
    company: 'Infrastructure Pro',
    type: 'internship',
    description: 'Manage infrastructure and deployments',
    requiredSkills: ['docker', 'linux', 'ci/cd'],
    optionalSkills: ['kubernetes', 'aws', 'terraform'],
    applyUrl: 'https://www.internshala.com/internships',
    source: 'internshala'
  }
];

module.exports = mockOpportunities;
