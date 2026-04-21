/**
 * External API Service
 * Fetches REAL internship and hackathon data from free, no-key APIs.
 *
 * Sources:
 *  1. Devpost     — real JSON API for live hackathons (no key needed)
 *  2. Remotive    — real JSON API for remote tech jobs/internships (no key needed)
 *  3. MLH         — Major League Hacking active hackathons (free)
 *
 * All results are normalized to the common Opportunity schema.
 * Falls back to enriched static data if all APIs fail.
 */

const axios = require('axios');
const { normalizeSkills } = require('./skillAliases');

// Axios instance with sane defaults
const http = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'SkillMatch/1.0 (Educational Project)',
    'Accept': 'application/json'
  }
});

/**
 * Map Devpost theme names to recognizable skill keywords
 */
const DEVPOST_THEME_SKILLS = {
  'Web':               ['html', 'css', 'javascript', 'react'],
  'Mobile':            ['react native', 'flutter', 'android', 'ios'],
  'Machine Learning':  ['python', 'machine learning', 'tensorflow', 'scikit-learn'],
  'Open Ended':        ['programming', 'problem solving'],
  'Education':         ['javascript', 'python', 'web development'],
  'Health':            ['python', 'data analysis', 'machine learning'],
  'Data Visualization':['python', 'd3.js', 'sql', 'data analysis'],
  'Blockchain':        ['solidity', 'web3', 'javascript', 'ethereum'],
  'Enterprise':        ['java', 'python', 'sql', 'cloud'],
  'Social Good':       ['javascript', 'python', 'web development'],
  'Fintech':           ['python', 'javascript', 'sql', 'finance'],
  'Cybersecurity':     ['python', 'networking', 'linux', 'security'],
  'Cloud Computing':   ['aws', 'google cloud', 'microsoft azure', 'docker'],
  'AR/VR':             ['unity', 'c#', 'unreal engine', '3d modeling'],
  'Gaming':            ['unity', 'c#', 'game development', 'javascript'],
};

/**
 * Extract skills from Devpost hackathon themes
 */
function skillsFromDevpostThemes(themes = []) {
  const skills = new Set();
  for (const theme of themes) {
    const mapped = DEVPOST_THEME_SKILLS[theme.name] || [];
    mapped.forEach(s => skills.add(s));
  }
  // Always add general hackathon skills
  skills.add('problem solving');
  skills.add('teamwork');
  return Array.from(skills);
}

/**
 * Extract skills from a Remotive job's tags and description
 */
function skillsFromRemotiveTags(tags = []) {
  const knownSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'ruby', 'go', 'rust', 'php',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring boot',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'google cloud', 'microsoft azure', 'docker', 'kubernetes',
    'machine learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'html', 'css', 'sass', 'graphql', 'rest api',
    'linux', 'git', 'ci cd', 'devops', 'agile',
    'sql', 'data analysis', 'mobile development', 'ios', 'android', 'flutter'
  ];

  const tagSet = new Set(tags.map(t => t.toLowerCase()));
  const matched = knownSkills.filter(s => {
    // Check if any tag contains or is contained in the skill
    return Array.from(tagSet).some(tag =>
      tag.includes(s) || s.includes(tag) || tag === s
    );
  });

  return matched.length > 0 ? matched : ['programming', 'problem solving'];
}

/**
 * Fetch LIVE hackathons from Devpost's real JSON API
 * No API key required — this is a public endpoint
 */
async function fetchFromDevpost() {
  try {
    console.log('📡 Fetching hackathons from Devpost API...');
    const response = await http.get('https://devpost.com/api/hackathons', {
      params: {
        'challenge_type[]': 'online',  // online hackathons only
        'order_by': 'recently-added',
        'page': 1
      }
    });

    const hackathons = response.data?.hackathons || [];
    console.log(`✅ Devpost returned ${hackathons.length} hackathons`);

    return hackathons.map(h => {
      const requiredSkills = normalizeSkills(skillsFromDevpostThemes(h.themes || []));
      const optionalSkills = normalizeSkills(['git', 'github', 'teamwork', 'communication']);

      return {
        title: h.title || 'Hackathon',
        company: h.organization_name || 'Devpost',
        type: 'hackathon',
        description: `${h.prize_amount ? `Prize: ${h.prize_amount}. ` : ''}${h.submission_period_dates || 'Check Devpost for dates.'}`,
        requiredSkills,
        optionalSkills,
        applyUrl: h.url || 'https://devpost.com/hackathons',
        source: 'devpost',
        location: h.displayed_location?.location || 'Online',
        prizePool: h.prize_amount || '',
        fetchedAt: new Date(),
        isActive: true
      };
    });
  } catch (error) {
    console.error('❌ Devpost API error:', error.message);
    return [];
  }
}

/**
 * Fetch LIVE remote tech jobs/internships from Remotive
 * No API key required — this is a public endpoint
 */
async function fetchFromRemotive() {
  try {
    console.log('📡 Fetching internships from Remotive API...');
    const response = await http.get('https://remotive.com/api/remote-jobs', {
      params: {
        category: 'software-dev',
        limit: 30
      }
    });

    const jobs = response.data?.jobs || [];
    // Filter to intern-level roles only
    const internships = jobs.filter(j => {
      const title = (j.title || '').toLowerCase();
      return (
        title.includes('intern') ||
        title.includes('junior') ||
        title.includes('entry') ||
        title.includes('graduate') ||
        title.includes('fresher') ||
        title.includes('trainee')
      );
    });

    // If too few interns found, take first 15 general roles
    const selected = internships.length >= 5 ? internships : jobs.slice(0, 15);
    console.log(`✅ Remotive returned ${selected.length} relevant jobs`);

    return selected.map(j => {
      const tags = j.tags || j.candidate_required_location ? (j.tags || []) : [];
      const requiredSkills = normalizeSkills(skillsFromRemotiveTags(tags));
      const optionalSkills = normalizeSkills(['communication', 'git', 'agile']);

      return {
        title: j.title || 'Software Developer',
        company: j.company_name || 'Remote Company',
        type: 'internship',
        description: `Remote opportunity. ${j.candidate_required_location ? `Location: ${j.candidate_required_location}.` : 'Fully remote.'}`,
        requiredSkills,
        optionalSkills,
        applyUrl: j.url || 'https://remotive.com',
        source: 'remotive',
        location: j.candidate_required_location || 'Remote',
        prizePool: j.salary || '',
        fetchedAt: new Date(),
        isActive: true
      };
    });
  } catch (error) {
    console.error('❌ Remotive API error:', error.message);
    return [];
  }
}

/**
 * Fetch active hackathons from MLH (Major League Hacking)
 * Uses the GitHub-based MLH API endpoint
 */
async function fetchFromMLH() {
  try {
    console.log('📡 Fetching hackathons from MLH...');
    // MLH publishes a public JSON of their current season hackathons
    const response = await http.get('https://mlh.io/seasons/2025/events.json');
    const events = Array.isArray(response.data) ? response.data : [];
    console.log(`✅ MLH returned ${events.length} events`);

    return events.slice(0, 10).map(e => ({
      title: e.name || 'MLH Hackathon',
      company: 'Major League Hacking',
      type: 'hackathon',
      description: `MLH Official Hackathon. ${e.city ? `Location: ${e.city}, ${e.state || e.country || ''}` : 'See MLH website for details.'}`,
      requiredSkills: normalizeSkills(['programming', 'problem solving', 'git']),
      optionalSkills: normalizeSkills(['javascript', 'python', 'react', 'node.js']),
      applyUrl: e.url || 'https://mlh.io/events',
      source: 'mlh',
      location: e.city ? `${e.city}, ${e.country || ''}` : 'Various',
      prizePool: '',
      fetchedAt: new Date(),
      isActive: true
    }));
  } catch (error) {
    console.error('❌ MLH API error:', error.message);
    return [];
  }
}

/**
 * High-quality fallback data — used only when ALL real APIs fail.
 * These are real platforms with real apply URLs.
 */
function getFallbackData() {
  console.log('⚠️  Using fallback data (all external APIs failed)');
  return [
    {
      title: 'Frontend Developer Intern',
      company: 'Internshala',
      type: 'internship',
      description: 'Work on React-based web applications. Apply via Internshala for current openings.',
      requiredSkills: ['react', 'javascript', 'html', 'css'],
      optionalSkills: ['typescript', 'redux', 'rest api'],
      applyUrl: 'https://internshala.com/internships/web-development-internship',
      source: 'fallback',
      location: 'Remote / India',
      prizePool: '',
      fetchedAt: new Date(),
      isActive: true
    },
    {
      title: 'Backend Developer Intern',
      company: 'LinkedIn Jobs',
      type: 'internship',
      description: 'Node.js & MongoDB backend development. Browse latest openings on LinkedIn.',
      requiredSkills: ['node.js', 'mongodb', 'express', 'javascript'],
      optionalSkills: ['docker', 'aws', 'graphql'],
      applyUrl: 'https://www.linkedin.com/jobs/internship-jobs',
      source: 'fallback',
      location: 'Remote',
      prizePool: '',
      fetchedAt: new Date(),
      isActive: true
    },
    {
      title: 'Full Stack Hackathon',
      company: 'Devpost',
      type: 'hackathon',
      description: 'Build full-stack applications and compete for prizes.',
      requiredSkills: ['javascript', 'react', 'node.js'],
      optionalSkills: ['aws', 'docker', 'mongodb'],
      applyUrl: 'https://devpost.com/hackathons',
      source: 'fallback',
      location: 'Online',
      prizePool: 'Various',
      fetchedAt: new Date(),
      isActive: true
    },
    {
      title: 'ML/AI Hackathon',
      company: 'Devpost',
      type: 'hackathon',
      description: 'Build machine learning models to solve real-world problems.',
      requiredSkills: ['python', 'machine learning', 'data analysis'],
      optionalSkills: ['tensorflow', 'pytorch', 'scikit-learn'],
      applyUrl: 'https://devpost.com/hackathons?themes[]=Machine%20Learning',
      source: 'fallback',
      location: 'Online',
      prizePool: 'Various',
      fetchedAt: new Date(),
      isActive: true
    },
    {
      title: 'Data Science Intern',
      company: 'Unstop',
      type: 'internship',
      description: 'Work with data pipelines and analytics. Find current listings on Unstop.',
      requiredSkills: ['python', 'sql', 'data analysis', 'pandas'],
      optionalSkills: ['machine learning', 'tableau', 'spark'],
      applyUrl: 'https://unstop.com/internships',
      source: 'fallback',
      location: 'Remote / India',
      prizePool: '',
      fetchedAt: new Date(),
      isActive: true
    },
    {
      title: 'Open Source Hackathon (Google Summer of Code)',
      company: 'Google',
      type: 'hackathon',
      description: 'Contribute to open source projects with mentorship from Google engineers.',
      requiredSkills: ['git', 'github', 'programming'],
      optionalSkills: ['python', 'javascript', 'c++'],
      applyUrl: 'https://summerofcode.withgoogle.com/',
      source: 'fallback',
      location: 'Remote',
      prizePool: '$3000 - $6000',
      fetchedAt: new Date(),
      isActive: true
    }
  ];
}

/**
 * Master fetch function — pulls from all sources in parallel.
 * Returns deduplicated, normalized results.
 */
async function fetchAllJobs() {
  try {
    const [devpost, remotive, mlh] = await Promise.allSettled([
      fetchFromDevpost(),
      fetchFromRemotive(),
      fetchFromMLH()
    ]);

    let allJobs = [];

    if (devpost.status === 'fulfilled')  allJobs = [...allJobs, ...devpost.value];
    if (remotive.status === 'fulfilled') allJobs = [...allJobs, ...remotive.value];
    if (mlh.status === 'fulfilled')      allJobs = [...allJobs, ...mlh.value];

    // Deduplicate by applyUrl
    const seen = new Set();
    allJobs = allJobs.filter(job => {
      if (seen.has(job.applyUrl)) return false;
      seen.add(job.applyUrl);
      return true;
    });

    if (allJobs.length === 0) {
      allJobs = getFallbackData();
    }

    console.log(`✅ Total: ${allJobs.length} opportunities fetched`);
    return allJobs;
  } catch (error) {
    console.error('❌ Master fetch error:', error);
    return getFallbackData();
  }
}

module.exports = {
  fetchAllJobs,
  fetchFromDevpost,
  fetchFromRemotive,
  fetchFromMLH
};
