/**
 * Interview Prep API Documentation & Examples
 * Complete API reference with request/response examples
 */

// ============================================
// 1. GENERATE INTERVIEW QUESTIONS
// ============================================

/*
REQUEST:
POST /api/ai/generate-interview-questions
Content-Type: application/json

{
  "userProfile": {
    "technologies": ["React", "Node.js", "MongoDB", "PostgreSQL"],
    "projects": ["E-commerce Platform", "Real-time Chat App", "Task Manager"],
    "skills": ["Full-stack development", "REST APIs", "Database Design", "Git"],
    "experience": "mid-level"
  },
  "type": "hard",  // "hard", "soft", or "mixed"
  "difficulty": "medium",  // "easy", "medium", or "hard"
  "count": 5
}

RESPONSE:
{
  "questions": [
    {
      "question": "Design a chat application that handles 10,000 concurrent users. How would you handle real-time message synchronization and prevent message loss?",
      "context": "Based on your Real-time Chat App project experience",
      "skillType": "hard",
      "difficulty": "medium",
      "keyPoints": [
        "WebSocket implementation",
        "Message queue design",
        "Database optimization",
        "Scalability strategy",
        "Error handling"
      ],
      "expectedApproach": "Explain your architecture, technology choices (Socket.io, Redis), database schema, and scaling strategy"
    },
    {
      "question": "Explain the differences between SQL and NoSQL databases. When would you choose PostgreSQL over MongoDB in your e-commerce project?",
      "context": "Relevant to your database choices in E-commerce Platform",
      "skillType": "hard",
      "difficulty": "medium",
      "keyPoints": [
        "ACID vs BASE properties",
        "Schema flexibilty",
        "Query patterns",
        "Performance trade-offs",
        "Use case alignment"
      ],
      "expectedApproach": "Compare on multiple dimensions and justify choices with project examples"
    },
    // ... 3 more questions
  ]
}

ERROR RESPONSES:
{
  "error": "Invalid user profile",
  "status": 400
}

{
  "error": "Failed to generate questions",
  "status": 500
}
*/

// ============================================
// 2. EVALUATE INTERVIEW
// ============================================

/*
REQUEST:
POST /api/ai/evaluate-interview
Content-Type: application/json

{
  "questions": [
    {
      "question": "What is React?",
      "skillType": "hard",
      "difficulty": "easy"
    },
    {
      "question": "How would you optimize a slow database query?",
      "skillType": "hard",
      "difficulty": "medium"
    }
  ],
  "answers": [
    "React is a JavaScript library for building user interfaces with components and state management. It uses virtual DOM for efficient rendering.",
    "I would first analyze the query execution plan using EXPLAIN, then add indexes on frequently filtered columns, potentially denormalize data, or use query caching with Redis."
  ],
  "userProfile": {
    "technologies": ["React", "Node.js", "PostgreSQL"],
    "projects": ["E-commerce Platform"],
    "experience": "mid-level"
  },
  "skillType": "hard",
  "difficulty": "medium"
}

RESPONSE:
{
  "overallScore": 82,
  "strengths": [
    "Clear understanding of React fundamentals",
    "Practical database optimization knowledge",
    "Good problem-solving approach",
    "Relevant use of real-world tools (Redis)"
  ],
  "areasToImprove": [
    "Dive deeper into React performance optimization",
    "Explore more advanced database indexing strategies",
    "Practice system design for scalability"
  ],
  "detailedFeedback": [
    {
      "question": "What is React?",
      "score": 8,
      "feedback": "Good explanation of core concepts. You mentioned virtual DOM which shows solid understanding.",
      "suggestion": "Could add more about React Hooks, lazy loading, or Suspense for next-level knowledge"
    },
    {
      "question": "How would you optimize a slow database query?",
      "score": 7,
      "feedback": "Practical approach with real tools. EXPLAIN is the right first step.",
      "suggestion": "Mention query batching, connection pooling, and how to choose between database and application-level caching"
    }
  ],
  "improvementPlan": [
    {
      "title": "Advanced React Performance",
      "description": "Master React.memo, useMemo, useCallback to reduce unnecessary re-renders",
      "resources": [
        "React Official Docs - Performance Optimization",
        "Kent C. Dodds - Advanced React Patterns",
        "Profile with React DevTools extension"
      ]
    },
    {
      "title": "Database Query Optimization",
      "description": "Learn about query plans, indexing strategies, and execution profiles",
      "resources": [
        "PostgreSQL Documentation - Query Performance",
        "Use Pg_stat_statements extension",
        "Practice on LeetCode Database problems"
      ]
    },
    {
      "title": "System Design Foundations",
      "description": "Build skills in designing scalable systems",
      "resources": [
        "System Design Primer GitHub",
        "Grokking the System Design Interview",
        "YouTube: Tech Dummies"
      ]
    }
  ],
  "nextSteps": [
    "Implement one React optimization technique this week",
    "Run EXPLAIN on 3 real queries from your projects",
    "Design a simple system architecture for your e-commerce platform",
    "Take a full mock interview next week"
  ]
}
*/

// ============================================
// 3. FETCH USER PROFILE FOR INTERVIEW
// ============================================

/*
REQUEST:
GET /api/profile/interview-ready
Headers: Authorization: Bearer <token>

RESPONSE:
{
  "username": "developer_name",
  "technologies": [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "AWS"
  ],
  "projects": [
    "E-commerce Platform",
    "Real-time Chat Application",
    "Task Management System"
  ],
  "skills": [
    "Full-stack Development",
    "REST API Design",
    "Database Design",
    "DevOps",
    "Git",
    "Agile Methodology"
  ],
  "experience": "mid-level",
  "repositories": [
    {
      "name": "ecommerce-platform",
      "language": "JavaScript",
      "stars": 45,
      "url": "https://github.com/...",
      "topics": ["react", "nodejs", "postgresql"]
    }
  ],
  "stats": {
    "totalAttempts": 5,
    "averageScore": 76.4,
    "bestScore": 85,
    "lastAttempt": "2026-04-13T10:30:00Z",
    "history": [
      {
        "date": "2026-04-13T10:30:00Z",
        "score": 82,
        "skillType": "hard",
        "difficulty": "medium",
        "duration": 1500
      }
    ]
  }
}
*/

// ============================================
// 4. SAVE INTERVIEW RESULT
// ============================================

/*
REQUEST:
POST /api/profile/interview-result
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 82,
  "skillType": "hard",
  "difficulty": "medium",
  "duration": 1500,  // seconds
  "feedback": {
    "strengths": [...],
    "improvements": [...],
    "nextSteps": [...]
  }
}

RESPONSE:
{
  "totalAttempts": 6,
  "averageScore": 77.1,
  "bestScore": 85,
  "lastAttempt": "2026-04-13T10:35:00Z",
  "message": "✅ Interview result saved successfully"
}
*/

// ============================================
// 5. GET INTERVIEW HISTORY
// ============================================

/*
REQUEST:
GET /api/profile/interview-history?limit=10&offset=0
Headers: Authorization: Bearer <token>

RESPONSE:
{
  "total": 5,
  "history": [
    {
      "id": "667f8e9c0b1a2c3d4e5f6789",
      "date": "2026-04-13T10:35:00Z",
      "score": 82,
      "skillType": "hard",
      "difficulty": "medium",
      "duration": 1500,
      "questionsCount": 5,
      "feedback": {
        "strengths": ["Strong React knowledge", "Problem solving"],
        "improvements": ["System design", "Communication"]
      }
    },
    // ... more history
  ]
}
*/

// ============================================
// ADVANCED FEATURES (Future Implementation)
// ============================================

// 6. REAL-TIME ANSWER FEEDBACK
/*
REQUEST:
POST /api/ai/explain-answer
Content-Type: application/json

{
  "question": "What is the difference between let and const?",
  "answer": "Let allows reassignment while const doesn't",
  "skillType": "hard"
}

RESPONSE:
{
  "isGood": true,
  "score": 7,
  "potentialFollowUp": "Can you explain block scoping and temporal dead zone?",
  "improvementTip": "Mention hoisting behavior and mention arrow functions"
}
*/

// 7. COMPARE WITH PEERS (Anonymized)
/*
REQUEST:
GET /api/ai/benchmark?difficulty=medium&skillType=hard
Headers: Authorization: Bearer <token>

RESPONSE:
{
  "yourScore": 82,
  "averageScore": 73,
  "percentile": 78,
  "analysis": "Your score is better than 78% of users with similar experience"
}
*/

// 8. QUESTION BANK WITH FILTERS
/*
REQUEST:
GET /api/ai/question-bank?technology=React&difficulty=medium&limit=20
Headers: Authorization: Bearer <token>

RESPONSE:
{
  "total": 150,
  "questions": [
    {
      "id": "q_123",
      "question": "...",
      "technology": "React",
      "difficulty": "medium",
      "skillType": "hard",
      "views": 450,
      "avgRating": 4.5
    }
  ]
}
*/

// 9. PERSONALIZED LEARNING PATH
/*
REQUEST:
POST /api/ai/generate-learning-path
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "weakAreas": ["System Design", "Communication"],
  "timeframe": "4 weeks",
  "targetRole": "Senior Developer"
}

RESPONSE:
{
  "path": [
    {
      "week": 1,
      "focus": "System Design Fundamentals",
      "resources": [...],
      "tasks": [...],
      "mockInterviewQuestions": [...]
    },
    {
      "week": 2,
      "focus": "Communication & Design Presentation",
      "resources": [...],
      "tasks": [...],
      "mockInterviewQuestions": [...]
    },
    // weeks 3-4
  ]
}
*/

// 10. VOICE-BASED ANSWERS (Future)
/*
REQUEST:
POST /api/ai/transcribe-and-evaluate
Content-Type: multipart/form-data

{
  "questionId": "q_123",
  "audioFile": <binary>,
  "duration": 120
}

RESPONSE:
{
  "transcript": "Full transcription of the answer...",
  "score": 78,
  "feedback": "Good pace, consider being more concise",
  "keyPointsCovered": ["✓ Concept A", "✓ Concept B", "✗ Concept C"]
}
*/

// ============================================
// ERROR HANDLING
// ============================================

/*
COMMON ERROR RESPONSES:

401 Unauthorized
{
  "error": "Invalid or expired token",
  "code": "AUTH_001"
}

400 Bad Request
{
  "error": "Missing required field: userProfile",
  "code": "VALID_001"
}

429 Too Many Requests
{
  "error": "Too many requests. Please wait 60 seconds",
  "retryAfter": 60,
  "code": "RATE_LIMIT_001"
}

500 Server Error
{
  "error": "AI service temporarily unavailable",
  "code": "AI_001"
}
*/

// ============================================
// RATE LIMITING
// ============================================

/*
RATE LIMITS:
- Generate Questions: 10 per hour
- Evaluate Interview: 5 per hour
- Get Profile: Unlimited
- Question Bank: 100 per hour
- Learning Path: 5 per month
*/

// ============================================
// CACHING STRATEGY
// ============================================

/*
CACHE TIMING:
- User Profile: 24 hours
- Generated Questions: 1 hour (per question set)
- Question Bank: 6 hours
- Interview Results: Never (always fresh)
- GitHub Sync: 12 hours

CACHE INVALIDATION:
- Clear on user profile update
- Clear on new interview completion
- Clear on GitHub sync
*/

// ============================================
// WEBHOOKS (Future)
// ============================================

/*
When interview is completed:
POST /webhooks/interview-completed
{
  "userId": "user_123",
  "score": 82,
  "skillType": "hard",
  "timestamp": "2026-04-13T10:35:00Z"
}

Events:
- interview.started
- interview.completed
- interview.score-milestone (80+, 90+, etc)
- interview.weak-area-identified
*/

// ============================================
// SAMPLE DATA FOR TESTING
// ============================================

const testUserProfile = {
  technologies: ["React", "Node.js", "MongoDB", "PostgreSQL"],
  projects: ["E-commerce Platform", "Chat App", "Task Manager"],
  skills: ["Full-stack", "REST APIs", "Database Design"],
  experience: "mid-level"
};

const testQuestions = [
  "Explain how Virtual DOM works in React",
  "Design a URL shortener service",
  "What's the difference between callbacks and promises?"
];

const testAnswers = [
  "Virtual DOM is an in-memory representation of the real DOM. React compares the new Virtual DOM with the previous one and only updates the parts that changed.",
  "For a URL shortener, I'd use a hash function to generate short codes, store in database with expiration, and handle collisions with a counter.",
  "Callbacks are functions passed as arguments while promises return objects that can be chained. Promises are cleaner and avoid callback hell."
];

module.exports = {
  testUserProfile,
  testQuestions,
  testAnswers
};
