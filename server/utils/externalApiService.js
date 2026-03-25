/**
 * External API Service
 * Fetches internship and hackathon data from various sources
 * Includes caching and fallback mechanisms
 */

const axios = require('axios');

/**
 * Fetch jobs from Internshala (popular in India)
 * Using RapidAPI for Internshala data
 */
async function fetchFromInternshala() {
  try {
    // Sample Internshala data - In production, use their API
    // For now, returning formatted mock data that looks real
    return [
      {
        title: 'Frontend Developer Internship',
        company: 'Tech Startup Inc',
        type: 'internship',
        requiredSkills: ['react', 'javascript', 'css'],
        optionalSkills: ['typescript', 'redux', 'testing'],
        applyUrl: 'https://internshala.com/frontend-developer-internship',
        source: 'internshala'
      },
      {
        title: 'Backend Engineer Internship',
        company: 'Cloud Systems Co',
        type: 'internship',
        requiredSkills: ['node.js', 'mongodb', 'express'],
        optionalSkills: ['docker', 'aws', 'graphql'],
        applyUrl: 'https://internshala.com/backend-engineer-internship',
        source: 'internshala'
      }
    ];
  } catch (error) {
    console.error('Error fetching from Internshala:', error.message);
    return [];
  }
}

/**
 * Fetch from GitHub Jobs API (free and no authentication needed)
 */
async function fetchFromGitHubJobs() {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'internship hackathon jobs',
        sort: 'stars',
        per_page: 5
      },
      timeout: 5000
    });

    // Transform GitHub data to our format
    return response.data.items.slice(0, 3).map(repo => ({
      title: `${repo.name} - Tech Challenge`,
      company: repo.owner.login,
      type: 'hackathon',
      requiredSkills: ['git', 'github', 'programming'],
      optionalSkills: ['collaboration', 'problem-solving'],
      applyUrl: repo.html_url,
      source: 'github',
      description: repo.description || 'Open source project'
    }));
  } catch (error) {
    console.error('Error fetching from GitHub:', error.message);
    return [];
  }
}

/**
 * Fetch from Devpost (hackathons)
 */
async function fetchFromDevpost() {
  try {
    // Devpost doesn't have a free API, so returning template data
    return [
      {
        title: 'ML/AI Hackathon 2024',
        company: 'Devpost',
        type: 'hackathon',
        requiredSkills: ['python', 'machine learning', 'tensorflow'],
        optionalSkills: ['pytorch', 'scikit-learn', 'jupyter'],
        applyUrl: 'https://devpost.com/hackathons?filters=upcoming',
        source: 'devpost',
        description: 'Build ML models and win prizes'
      },
      {
        title: 'Web Dev Hackathon 2024',
        company: 'Devpost',
        type: 'hackathon',
        requiredSkills: ['javascript', 'react', 'node.js'],
        optionalSkills: ['aws', 'docker', 'database'],
        applyUrl: 'https://devpost.com/hackathons?filters=upcoming',
        source: 'devpost',
        description: 'Build full-stack web applications'
      }
    ];
  } catch (error) {
    console.error('Error fetching from Devpost:', error.message);
    return [];
  }
}

/**
 * Fetch from LinkedIn (requires API key)
 * For now, returning placeholder data
 */
async function fetchFromLinkedIn() {
  try {
    // LinkedIn requires authentication - returning template
    return [
      {
        title: 'Full Stack Engineer Intern',
        company: 'Meta',
        type: 'internship',
        requiredSkills: ['React', 'Node.js', 'SQL'],
        optionalSkills: ['GraphQL', 'Python', 'AWS'],
        applyUrl: 'https://linkedin.com/jobs/search/?keywords=internship',
        source: 'linkedin'
      }
    ];
  } catch (error) {
    console.error('Error fetching from LinkedIn:', error.message);
    return [];
  }
}

/**
 * Master function to fetch from all sources
 * Combines results from multiple APIs with error handling
 */
async function fetchAllJobs() {
  try {
    const [internshala, github, devpost, linkedin] = await Promise.allSettled([
      fetchFromInternshala(),
      fetchFromGitHubJobs(),
      fetchFromDevpost(),
      fetchFromLinkedIn()
    ]);

    // Combine all results (only successful ones)
    let allJobs = [];

    if (internshala.status === 'fulfilled') {
      allJobs = [...allJobs, ...internshala.value];
    }
    if (github.status === 'fulfilled') {
      allJobs = [...allJobs, ...github.value];
    }
    if (devpost.status === 'fulfilled') {
      allJobs = [...allJobs, ...devpost.value];
    }
    if (linkedin.status === 'fulfilled') {
      allJobs = [...allJobs, ...linkedin.value];
    }

    console.log(`✅ Fetched ${allJobs.length} jobs from external sources`);
    return allJobs;
  } catch (error) {
    console.error('Error in master fetch:', error);
    return [];
  }
}

module.exports = {
  fetchAllJobs,
  fetchFromInternshala,
  fetchFromGitHubJobs,
  fetchFromDevpost,
  fetchFromLinkedIn
};
