/**
 * Skill Aliases & Normalization
 * Maps common abbreviations, typos, and alternate names
 * to a single canonical skill name.
 *
 * Used by the matching algorithm on BOTH user input and opportunity skills
 * so that "js" matches "javascript", "py" matches "python", etc.
 */

const SKILL_ALIASES = {
  // JavaScript ecosystem
  'js':           'javascript',
  'es6':          'javascript',
  'es2015':       'javascript',
  'ecmascript':   'javascript',
  'ts':           'typescript',
  'jsx':          'react',
  'react.js':     'react',
  'reactjs':      'react',
  'react js':     'react',
  'vue.js':       'vue',
  'vuejs':        'vue',
  'vue js':       'vue',
  'angular.js':   'angular',
  'angularjs':    'angular',
  'next.js':      'next.js',
  'nextjs':       'next.js',
  'nuxt.js':      'nuxt.js',
  'nuxtjs':       'nuxt.js',
  'node':         'node.js',
  'nodejs':       'node.js',
  'node js':      'node.js',
  'express.js':   'express',
  'expressjs':    'express',

  // Python ecosystem
  'py':           'python',
  'python3':      'python',
  'py3':          'python',
  'tf':           'tensorflow',
  'tensor flow':  'tensorflow',
  'pt':           'pytorch',
  'sk-learn':     'scikit-learn',
  'sklearn':      'scikit-learn',
  'scikit':       'scikit-learn',
  'pandas':       'pandas',         // already canonical, keep for typos
  'numpy':        'numpy',

  // Databases
  'mongo':        'mongodb',
  'mongo db':     'mongodb',
  'postgres':     'postgresql',
  'psql':         'postgresql',
  'pg':           'postgresql',
  'mysql8':       'mysql',
  'mssql':        'sql server',
  'ms sql':       'sql server',
  'redis db':     'redis',
  'elastic':      'elasticsearch',
  'es':           'elasticsearch',

  // Cloud & DevOps
  'k8s':          'kubernetes',
  'kube':         'kubernetes',
  'docker compose': 'docker',
  'gcp':          'google cloud',
  'google cloud platform': 'google cloud',
  'aws s3':       'aws',
  'amazon web services': 'aws',
  'azure':        'microsoft azure',
  'ms azure':     'microsoft azure',
  'terraform':    'terraform',
  'terraf':       'terraform',
  'ci/cd':        'ci cd',
  'cicd':         'ci cd',


  // ML / AI
  'ml':           'machine learning',
  'ai':           'artificial intelligence',
  'dl':           'deep learning',
  'nlp':          'natural language processing',
  'cv':           'computer vision',
  'rl':           'reinforcement learning',
  'gen ai':       'generative ai',
  'genai':        'generative ai',
  'llm':          'large language models',

  // General programming
  'c++':          'cpp',
  'c plus plus':  'cpp',
  'oop':          'object oriented programming',
  'dsa':          'data structures',
  'ds':           'data structures',
  'algo':         'algorithms',
  'rest':         'rest api',
  'restful':      'rest api',
  'graphql api':  'graphql',
  'sql query':    'sql',
  'html5':        'html',
  'css3':         'css',
  'scss':         'sass',
  'sass/scss':    'sass',

  // Mobile
  'rn':           'react native',
  'flutter dart': 'flutter',
  'ios dev':      'ios',
  'android dev':  'android',

  // Indian college-specific
  'cn':           'computer networks',
  'os':           'operating systems',
  'dbms':         'database management',
  'oops':         'object oriented programming',
  'web dev':      'web development',
  'app dev':      'mobile development',
  'competitive programming': 'competitive programming',
  'cp':           'competitive programming',

  // Tools
  'git hub':      'github',
  'vs code':      'vscode',
  'figma design': 'figma',
  'postman api':  'postman',
  'jira software':'jira',
  'linux os':     'linux',
};

/**
 * Normalize a single skill string to its canonical form.
 * 1. Trim whitespace
 * 2. Convert to lowercase
 * 3. Look up in alias map
 * 4. Return canonical form, or the lowercased original if no alias found
 *
 * @param {string} skill - Raw skill input from user or DB
 * @returns {string} Canonical skill name
 */
function normalizeSkill(skill) {
  if (typeof skill !== 'string') return '';
  const cleaned = skill.trim().toLowerCase();
  return SKILL_ALIASES[cleaned] || cleaned;
}

/**
 * Normalize an array of skills
 * @param {string[]} skills
 * @returns {string[]} Normalized skill array (empty strings removed)
 */
function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map(normalizeSkill)
    .filter(s => s.length > 0);
}

module.exports = { SKILL_ALIASES, normalizeSkill, normalizeSkills };
