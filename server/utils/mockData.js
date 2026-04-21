/**
 * Mock Opportunities Data
 * Used ONLY as last-resort fallback when DB is unavailable AND all external APIs fail.
 * All URLs point to filtered search pages (as close to specific listings as possible)
 * since we can't hardcode URLs to listings that change daily.
 */
const mockOpportunities = [
  {
    _id: 'mock_1',
    title: 'Frontend Developer Intern',
    company: 'Internshala',
    type: 'internship',
    description: 'Internshala lists 1000s of web dev internships updated daily. Click Apply to browse current React/JavaScript openings.',
    requiredSkills: ['react', 'javascript', 'css'],
    optionalSkills: ['typescript', 'redux', 'sass'],
    applyUrl: 'https://internshala.com/internships/web-development-internship',
    source: 'fallback',
    location: 'Remote / India'
  },
  {
    _id: 'mock_2',
    title: 'Python & Data Science Intern',
    company: 'Internshala',
    type: 'internship',
    description: 'Find data science and ML internships on Internshala. Roles frequently posted by startups and large companies.',
    requiredSkills: ['python', 'data analysis', 'sql'],
    optionalSkills: ['machine learning', 'pandas', 'scikit-learn'],
    applyUrl: 'https://internshala.com/internships/data-science-internship',
    source: 'fallback',
    location: 'Remote / India'
  },
  {
    _id: 'mock_3',
    title: 'Full Stack Developer Hackathon',
    company: 'Devpost',
    type: 'hackathon',
    description: 'Live hackathons on Devpost updated continuously. Build, submit, and win prizes. Online participation available worldwide.',
    requiredSkills: ['javascript', 'react', 'node.js'],
    optionalSkills: ['mongodb', 'docker', 'aws'],
    applyUrl: 'https://devpost.com/hackathons?themes[]=Web',
    source: 'fallback',
    location: 'Online'
  },
  {
    _id: 'mock_4',
    title: 'AI / Machine Learning Hackathon',
    company: 'Devpost',
    type: 'hackathon',
    description: 'ML-focused hackathons with real prize pools. New events added every week on Devpost.',
    requiredSkills: ['python', 'machine learning', 'data analysis'],
    optionalSkills: ['tensorflow', 'pytorch', 'scikit-learn'],
    applyUrl: 'https://devpost.com/hackathons?themes[]=Machine+Learning',
    source: 'fallback',
    location: 'Online'
  },
  {
    _id: 'mock_5',
    title: 'Software Engineer Intern (Remote)',
    company: 'LinkedIn Jobs',
    type: 'internship',
    description: 'Browse thousands of remote software engineering internships on LinkedIn. Use filters for your country and stack.',
    requiredSkills: ['javascript', 'python', 'git'],
    optionalSkills: ['docker', 'sql', 'rest api'],
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=software+engineer+intern&f_WT=2&f_E=1',
    source: 'fallback',
    location: 'Remote'
  },
  {
    _id: 'mock_6',
    title: 'Google Summer of Code',
    company: 'Google',
    type: 'hackathon',
    description: 'Paid open source program with mentorship from Google engineers. Stipend: $3000–$6600. Apply with any major programming language.',
    requiredSkills: ['git', 'github', 'programming'],
    optionalSkills: ['python', 'javascript', 'cpp'],
    applyUrl: 'https://summerofcode.withgoogle.com/',
    source: 'fallback',
    location: 'Remote',
    prizePool: '$3,000 – $6,600'
  },
  {
    _id: 'mock_7',
    title: 'Backend / Node.js Intern',
    company: 'Unstop',
    type: 'internship',
    description: 'Unstop (formerly D2C) lists internships from top Indian companies. Filter by Node.js, Express, MongoDB roles.',
    requiredSkills: ['node.js', 'express', 'mongodb'],
    optionalSkills: ['docker', 'graphql', 'aws'],
    applyUrl: 'https://unstop.com/internships?domain=coding',
    source: 'fallback',
    location: 'Remote / India'
  },
  {
    _id: 'mock_8',
    title: 'MLH Hackathon Season',
    company: 'Major League Hacking',
    type: 'hackathon',
    description: 'MLH runs 200+ hackathons per year globally. Find events near you or fully online. Free to participate.',
    requiredSkills: ['programming', 'problem solving', 'git'],
    optionalSkills: ['javascript', 'python', 'react'],
    applyUrl: 'https://mlh.io/events',
    source: 'fallback',
    location: 'Global / Online'
  }
];

module.exports = mockOpportunities;
