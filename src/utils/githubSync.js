/**
 * GitHub Profile Sync Utility
 * Fetches user's GitHub profile, projects, and tech stack
 * for personalized interview question generation
 */

export const fetchGitHubProfile = async (username) => {
  try {
    const response = await fetch(`/api/github/profile?username=${username}`);
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    return null;
  }
};

export const extractTechStack = (repositories) => {
  const technologies = new Set();
  
  repositories.forEach(repo => {
    // Extract from language field
    if (repo.language) {
      technologies.add(repo.language);
    }
    
    // Extract from topics
    if (repo.topics && Array.isArray(repo.topics)) {
      repo.topics.forEach(topic => {
        if (topic.length > 2 && topic.length < 20) {
          technologies.add(topic.toLowerCase());
        }
      });
    }
    
    // Extract from description
    if (repo.description) {
      const keywords = extractKeywordsFromText(repo.description);
      keywords.forEach(kw => technologies.add(kw));
    }
  });
  
  return Array.from(technologies).filter(t => t && t.length > 0);
};

export const extractProjectsData = (repositories) => {
  return repositories
    .filter(repo => !repo.fork && repo.stargazers_count > 0)
    .slice(0, 10)
    .map(repo => ({
      name: repo.name,
      description: repo.description || 'No description',
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      topics: repo.topics,
      keywords: extractKeywordsFromText(repo.description || '')
    }));
};

export const extractSkillsFromProfile = (profile, repositories) => {
  const skills = new Set();
  
  // From bio and company
  const text = `${profile.bio || ''} ${profile.company || ''}`.toLowerCase();
  const skillKeywords = ['developer', 'engineer', 'fullstack', 'frontend', 'backend', 'devops', 'ml', 'ai', 'data', 'mobile', 'react', 'node', 'python', 'java'];
  
  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      skills.add(skill);
    }
  });
  
  // From repositories
  repositories.forEach(repo => {
    if (repo.language) {
      skills.add(repo.language.toLowerCase());
    }
  });
  
  return Array.from(skills);
};

export const extractStrengthAreas = (repositories) => {
  const areas = {};
  
  repositories.forEach(repo => {
    const language = repo.language?.toLowerCase() || 'other';
    if (!areas[language]) {
      areas[language] = {
        count: 0,
        stars: 0,
        projects: []
      };
    }
    areas[language].count += 1;
    areas[language].stars += repo.stargazers_count || 0;
    areas[language].projects.push(repo.name);
  });
  
  // Sort by number of projects and stars
  return Object.entries(areas)
    .sort((a, b) => (b[1].stars + b[1].count) - (a[1].stars + a[1].count))
    .map(([area, data]) => ({
      area,
      projects: data.count,
      stars: data.stars
    }))
    .slice(0, 5);
};

const extractKeywordsFromText = (text) => {
  if (!text) return [];
  
  const commonKeywords = {
    'react': ['react', 'reactjs'],
    'vue': ['vue', 'vuejs'],
    'angular': ['angular'],
    'node': ['node', 'nodejs', 'express'],
    'python': ['python', 'django', 'flask', 'fastapi'],
    'java': ['java', 'spring', 'springboot'],
    'golang': ['go', 'golang'],
    'rust': ['rust'],
    'database': ['sql', 'mongodb', 'postgres', 'mysql', 'firebase'],
    'devops': ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'devops', 'ci/cd'],
    'ml': ['machine learning', 'tensorflow', 'pytorch', 'ml', 'ai', 'deep learning']
  };
  
  const lowerText = text.toLowerCase();
  const found = [];
  
  Object.entries(commonKeywords).forEach(([category, keywords]) => {
    if (keywords.some(kw => lowerText.includes(kw))) {
      found.push(category);
    }
  });
  
  return found;
};

export const prepareInterviewProfile = async (userProfile) => {
  try {
    // Combine all data for interview question generation
    const githubUsername = userProfile?.username || userProfile?.githubUsername;
    
    if (!githubUsername) {
      return {
        technologies: userProfile?.technologies || [],
        projects: userProfile?.projects || [],
        skills: userProfile?.skills || [],
        experience: userProfile?.experience || 'fresher',
        strengths: userProfile?.strengths || []
      };
    }
    
    // If we need to fetch fresh data
    const repositories = userProfile?.repositories || [];
    
    return {
      technologies: extractTechStack(repositories),
      projects: extractProjectsData(repositories).map(p => p.name),
      skills: extractSkillsFromProfile(userProfile || {}, repositories),
      experience: calculateExperienceLevel(repositories),
      strengths: extractStrengthAreas(repositories)
    };
    
  } catch (error) {
    console.error('Error preparing interview profile:', error);
    return {
      technologies: [],
      projects: [],
      skills: [],
      experience: 'fresher',
      strengths: []
    };
  }
};

const calculateExperienceLevel = (repositories) => {
  if (!repositories || repositories.length === 0) return 'fresher';
  
  const totalStars = repositories.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const contributionRepos = repositories.filter(r => !r.fork).length;
  
  if (totalStars > 1000 && contributionRepos > 10) return 'senior';
  if (totalStars > 300 && contributionRepos > 5) return 'mid-level';
  if (totalStars > 50 && contributionRepos > 2) return 'junior';
  return 'fresher';
};

export const syncUserDataForInterview = async () => {
  try {
    // Get current user profile from backend
    const profileResponse = await fetch('/api/profile');
    const userProfile = await profileResponse.json();
    
    // Prepare comprehensive interview profile
    const interviewProfile = await prepareInterviewProfile(userProfile);
    
    // Save to localStorage for quick access
    localStorage.setItem('interviewProfile', JSON.stringify(interviewProfile));
    
    return interviewProfile;
  } catch (error) {
    console.error('Error syncing user data:', error);
    
    // Try to use cached data
    const cached = localStorage.getItem('interviewProfile');
    return cached ? JSON.parse(cached) : null;
  }
};

export const getStoredInterviewProfile = () => {
  try {
    const cached = localStorage.getItem('interviewProfile');
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error retrieving interview profile:', error);
    return null;
  }
};
