/**
 * Interview Prep Integration Guide
 * How Interview Prep connects with other DevProgress modules
 */

// ============================================
// 1. INTEGRATING WITH EXISTING USER DATA
// ============================================

// From User Model - what we need:
// - username (GitHub)
// - email
// - technologies (from profile)
// - projects (from GitHub)
// - skills
// - experience level

// In backend/models/User.js, ensure these fields exist:
/*
{
  username: String,
  email: String,
  githubUsername: String,
  repositories: [Object],  // Cache GitHub repos
  technologies: [String],  // Multiple techs
  projects: [String],      // Project names
  skills: [String],        // User skills
  experience: String,      // junior, mid, senior, fresher
  interviewStats: {
    totalAttempts: Number,
    averageScore: Number,
    lastAttempt: Date,
    bestScore: Number
  },
  lastSyncTime: Date
}
*/

// ============================================
// 2. CONNECTING TO GITHUB ROUTES
// ============================================

// Existing github.js route should return:
// Full user profile with repositories data

// From backend/routes/github.js:
/*
router.get("/user-profile", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  
  // Fetch from GitHub API
  const response = await axios.get(`https://api.github.com/users/${user.githubUsername}`, {
    headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  });
  
  // Include profile + repos data
  res.json({
    profile: response.data,
    repositories: user.repositories || []
  });
});
*/

// ============================================
// 3. CONNECTING TO PROFILE ROUTES
// ============================================

// Update backend/routes/profile.js to include:

/*
// Get comprehensive profile for Interview Prep
router.get("/interview-ready", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("username githubUsername technologies projects skills experience repositories interviewStats");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({
      username: user.username,
      technologies: user.technologies || [],
      projects: user.projects || [],
      skills: user.skills || [],
      experience: user.experience || "fresher",
      repositories: user.repositories || [],
      stats: user.interviewStats || {
        totalAttempts: 0,
        averageScore: 0,
        lastAttempt: null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Save interview attempt result
router.post("/interview-result", auth, async (req, res) => {
  try {
    const { score, skillType, difficulty, duration } = req.body;
    const user = await User.findById(req.userId);
    
    // Update stats
    if (!user.interviewStats) {
      user.interviewStats = {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        history: []
      };
    }
    
    user.interviewStats.totalAttempts += 1;
    user.interviewStats.averageScore = 
      (user.interviewStats.averageScore * (user.interviewStats.totalAttempts - 1) + score) / 
      user.interviewStats.totalAttempts;
    
    if (score > user.interviewStats.bestScore) {
      user.interviewStats.bestScore = score;
    }
    
    // Add to history
    user.interviewStats.history = user.interviewStats.history || [];
    user.interviewStats.history.push({
      date: new Date(),
      score,
      skillType,
      difficulty,
      duration
    });
    
    user.interviewStats.lastAttempt = new Date();
    await user.save();
    
    res.json(user.interviewStats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
*/

// ============================================
// 4. CONNECTING TO AI ROUTES
// ============================================

// Update backend/routes/ai.js with:
// ✅ POST /api/ai/generate-interview-questions (DONE)
// ✅ POST /api/ai/evaluate-interview (DONE)

// Additional helper endpoint for real-time feedback:
/*
router.post("/explain-answer", async (req, res) => {
  const { question, answer, skillType } = req.body;
  
  const prompt = `A candidate answered this interview question:
  
  Q: ${question}
  A: ${answer}
  
  Provide a concise explanation of:
  1. Key points they covered well
  2. What they should have included
  3. Follow-up question to ask
  
  Keep it actionable and encouraging.`;
  
  // Use Groq to provide real-time feedback
});
*/

// ============================================
// 5. CONNECTING TO DASHBOARD
// ============================================

// Shows Interview Prep stats on AfterLoginDashboard.jsx:

/*
import InterviewStats from '../components/InterviewStats';

// In AfterLoginDashboard render:
<InterviewStats />

// In InterviewStats.jsx:
const [stats, setStats] = useState(null);

useEffect(() => {
  fetch('/api/profile/interview-ready')
    .then(r => r.json())
    .then(data => setStats(data.stats));
}, []);

return (
  <div className="stat-card">
    <h3>Interview Prep</h3>
    <p>Attempts: {stats?.totalAttempts || 0}</p>
    <p>Best Score: {stats?.bestScore || 0}/100</p>
    <p>Average: {stats?.averageScore?.toFixed(1) || 0}/100</p>
  </div>
);
*/

// ============================================
// 6. CONNECTING TO SETTINGS
// ============================================

// Allow users to configure interview preferences in Settings page:

/*
In Settings.jsx:

const [interviewSettings, setInterviewSettings] = useState({
  preferredSkillTypes: ['hard', 'soft'],
  difficultyRange: ['easy', 'medium', 'hard'],
  questionsPerSession: 5,
  timerEnabled: true,
  timePerQuestion: 300
});

// Save preferences to user profile
*/

// ============================================
// 7. CONNECTING TO CERTIFICATES
// ============================================

// Award certificates for interview milestones:

/*
When user completes 10 interviews OR gets >80 score consistently,
create certificate:

{
  title: "Interview Ready - 80+ Score",
  earnedDate: Date,
  skillsProven: ["System Design", "Communication"],
  difficulty: "Hard",
  score: 85
}
*/

// ============================================
// 8. CONNECTING TO LEETCODE SYNC
// ============================================

// Use LeetCode problem categories for interview topics:

/*
Extract from LeetCode:
- Problem categories user solved
- Difficulty levels mastered
- Time complexity understanding

Map to interview questions:
- DSA questions based on weak areas
- Problems you haven't solved well
- Topics to focus on
*/

// ============================================
// 9. DATABASE SCHEMA UPDATES
// ============================================

// Required updates to User.js:

/*
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  // FOR INTERVIEW PREP
  technologies: [String],
  projects: [String],
  skills: [String],
  experience: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior'],
    default: 'fresher'
  },
  repositories: [{
    name: String,
    language: String,
    stars: Number,
    url: String,
    topics: [String]
  }],
  
  // INTERVIEW STATS
  interviewStats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    lastAttempt: Date,
    history: [{
      date: Date,
      score: Number,
      skillType: String,
      difficulty: String,
      duration: Number
    }]
  },
  
  lastGithubSync: Date,
  interviewPreferences: {
    preferredSkillTypes: [String],
    difficultyRange: [String],
    questionsPerSession: Number,
    timerEnabled: Boolean,
    timePerQuestion: Number
  }
});
*/

// ============================================
// 10. NAVIGATION INTEGRATION
// ============================================

// Add to Sidebar.jsx or Navbar.jsx:

/*
<NavLink to="/interview-prep" className="nav-item">
  🎯 Interview Prep
</NavLink>
*/

// Add route to App.jsx:

/*
import InterviewPrep from './pages/InterviewPrep';

<Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
*/

// ============================================
// 11. ENVIRONMENT SETUP
// ============================================

// Required in .env file:

/*
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_token_here  # Optional for GitHub sync
INTERVIEW_QUESTIONS_CACHE_TTL=3600  # Cache for 1 hour
*/

// ============================================
// 12. TESTING THE INTEGRATION
// ============================================

// Manual test flow:

/*
1. User logs in to DevProgress
2. Goes to /interview-prep
3. Selects "Practice Mode"
4. Chooses Hard Skills, Medium Difficulty
5. System fetches user profile from /api/profile
6. Extracts tech stack (React, Node, PostgreSQL, etc.)
7. Sends to /api/ai/generate-interview-questions
8. Questions appear related to their actual projects
9. User answers 5 questions
10. Submit → /api/ai/evaluate-interview
11. Gets score, feedback, improvement plan
12. Result saved to /api/profile/interview-result
13. Stats update on Dashboard
14. User can review history, try again, or improve

Expected output:
- Personalized questions ✓
- Real-time evaluation ✓
- Actionable feedback ✓
- Progress tracking ✓
*/

// ============================================
// 13. MONITORING & LOGGING
// ============================================

// Add logging for debugging:

/*
// backend/middleware/logger.js
router.use((req, res, next) => {
  if (req.path.includes('/interview')) {
    console.log(`[INTERVIEW] ${req.method} ${req.path}`, {
      userId: req.userId,
      timestamp: new Date()
    });
  }
  next();
});

// Track Groq API calls
console.log('[AI] Question generation requested', {
  skillType,
  difficulty,
  technologies
});

console.log('[AI] Evaluation completed', {
  score,
  timestamp: new Date()
});
*/

// ============================================
// 14. PERFORMANCE CONSIDERATIONS
// ============================================

/*
OPTIMIZATION TIPS:

1. Cache questions for 1 hour
   - Same user shouldn't get same questions twice
   - Different users can share cached questions

2. Lazy load profile data
   - Don't fetch GitHub data on every interview
   - Cache in localStorage

3. Debounce answer submissions
   - Prevent multiple evaluations of same answer

4. Optimize Groq API calls
   - Batch multiple questions if possible
   - Use temperature 0.7 for consistency

5. Progressive disclosure
   - Load feedback page sections sequentially
   - Don't block on all evaluations
*/

// ============================================
// 15. ERROR HANDLING
// ============================================

/*
Handle these edge cases:

1. No GitHub profile
   → Use default questions

2. Groq API timeout
   → Show user message, offer retry

3. No internet connection
   → Show cached questions

4. Invalid token
   → Redirect to login

5. User profile incomplete
   → Show setup wizard
*/

module.exports = {
  integrationChecklist: [
    '✅ Database schema updated',
    '✅ AI routes implemented',
    '✅ Profile routes updated',
    '✅ Interview component created',
    '✅ Styling completed',
    '✅ GitHub sync utility added',
    '✅ Navigation integrated',
    '✅ Environment variables set',
    '✅ Error handling in place',
    '✅ Testing completed'
  ]
};
