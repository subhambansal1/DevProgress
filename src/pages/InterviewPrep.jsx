import { useState, useEffect } from 'react';
import '../styles/InterviewPrep.css';
import { syncUserDataForInterview, getStoredInterviewProfile } from '../utils/githubSync';

const InterviewPrep = () => {
  const [stage, setStage] = useState('landing'); // landing, options, practice, mock, feedback
  const [userProfile, setUserProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [skillType, setSkillType] = useState('hard'); // hard, soft, mixed
  const [loading, setLoading] = useState(false);

  // Fetch and sync user profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);
      try {
        // Try to sync new data from GitHub
        const synced = await syncUserDataForInterview();
        setUserProfile(synced);
      } catch (error) {
        console.error('Error initializing profile:', error);
        // Fallback to stored data
        const stored = getStoredInterviewProfile();
        setUserProfile(stored);
      }
      setLoading(false);
    };
    
    initializeProfile();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && isRunning) {
      setIsRunning(false);
      handleSubmitAnswer();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Generate questions from AI based on user's skills
  const generateQuestions = async (type, level) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: userProfile || { skills: ['JavaScript', 'React'], technologies: ['Frontend'] },
          type, // hard, soft, mixed
          difficulty: level, // easy, medium, hard
          count: 5
        })
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
      } else {
        // Fallback questions if API fails
        setQuestions(getDefaultQuestions(type, level));
        setAnswers(new Array(5).fill(''));
      }
      setCurrentQuestion(0);
      setTimer(300);
      setStage(stage === 'practice' ? 'practice' : 'mock');
    } catch (error) {
      console.error('Error generating questions:', error);
      // Use fallback on error
      setQuestions(getDefaultQuestions(type, level));
      setAnswers(new Array(5).fill(''));
      setCurrentQuestion(0);
      setTimer(300);
      setStage(stage === 'practice' ? 'practice' : 'mock');
    }
    setLoading(false);
  };

  // Fallback questions when API fails
  const getDefaultQuestions = (type, level) => {
    const questionBank = {
      hard_easy: [
        {
          question: "What is JavaScript and what makes it unique?",
          context: "Fundamental JS question",
          skillType: "hard",
          difficulty: "easy",
          keyPoints: ["Dynamic typing", "Event-driven", "Prototype-based"],
          expectedApproach: "Explain basics of JS"
        },
        {
          question: "Describe the concept of closures in JavaScript.",
          context: "Intermediate JS concept",
          skillType: "hard",
          difficulty: "easy",
          keyPoints: ["Lexical scoping", "Inner functions", "Data privacy"],
          expectedApproach: "Explain with example"
        },
        {
          question: "What is the difference between let, const, and var?",
          context: "ES6 features",
          skillType: "hard",
          difficulty: "easy",
          keyPoints: ["Hoisting", "Scope", "Redeclaration"],
          expectedApproach: "Compare and contrast"
        },
        {
          question: "How does the event loop work in JavaScript?",
          context: "Async programming",
          skillType: "hard",
          difficulty: "easy",
          keyPoints: ["Call stack", "Task queue", "Microtasks"],
          expectedApproach: "Explain flow with example"
        },
        {
          question: "What are promises and how do they work?",
          context: "Async/await basics",
          skillType: "hard",
          difficulty: "easy",
          keyPoints: ["States", "Resolved/Rejected", "Chaining"],
          expectedApproach: "Explain promise lifecycle"
        }
      ],
      hard_medium: [
        {
          question: "Explain polymorphism and how it's used in React components.",
          context: "Advanced React patterns",
          skillType: "hard",
          difficulty: "medium",
          keyPoints: ["HOCs", "Render props", "Component composition"],
          expectedApproach: "Explain with practical examples"
        },
        {
          question: "How would you optimize a React application's performance?",
          context: "React optimization",
          skillType: "hard",
          difficulty: "medium",
          keyPoints: ["Memoization", "Code splitting", "Lazy loading"],
          expectedApproach: "List techniques and explain"
        },
        {
          question: "What is the Virtual DOM and why does React use it?",
          context: "React internals",
          skillType: "hard",
          difficulty: "medium",
          keyPoints: ["Rendering", "Diffing", "Reconciliation"],
          expectedApproach: "Explain benefits and process"
        },
        {
          question: "Describe your experience with state management. Which would you choose and why?",
          context: "Application architecture",
          skillType: "hard",
          difficulty: "medium",
          keyPoints: ["Redux", "Context API", "Zustand"],
          expectedApproach: "Compare solutions with tradeoffs"
        },
        {
          question: "How do you handle API errors and loading states in your applications?",
          context: "Real-world patterns",
          skillType: "hard",
          difficulty: "medium",
          keyPoints: ["Error handling", "Loading states", "Retry logic"],
          expectedApproach: "Describe implementation strategy"
        }
      ],
      hard_hard: [
        {
          question: "Design a system to cache API responses with invalidation strategy.",
          context: "System design",
          skillType: "hard",
          difficulty: "hard",
          keyPoints: ["Cache layers", "Invalidation", "TTL strategies"],
          expectedApproach: "Discuss architecture and tradeoffs"
        },
        {
          question: "How would you implement real-time collaborative editing like Google Docs?",
          context: "Complex systems",
          skillType: "hard",
          difficulty: "hard",
          keyPoints: ["WebSockets", "OT/CRDT", "Conflict resolution"],
          expectedApproach: "Explain algorithm and implementation"
        },
        {
          question: "Explain your approach to debugging production issues in a microservices architecture.",
          context: "Production systems",
          skillType: "hard",
          difficulty: "hard",
          keyPoints: ["Logging", "Tracing", "Monitoring"],
          expectedApproach: "Describe debugging workflow"
        },
        {
          question: "Design a notification system that scales to millions of users.",
          context: "Scalable systems",
          skillType: "hard",
          difficulty: "hard",
          keyPoints: ["Message queues", "Distribution", "Reliability"],
          expectedApproach: "System design approach"
        },
        {
          question: "How do you approach security in a full-stack application?",
          context: "Security considerations",
          skillType: "hard",
          difficulty: "hard",
          keyPoints: ["OWASP", "Auth", "Data protection"],
          expectedApproach: "Comprehensive security discussion"
        }
      ],
      soft_easy: [
        {
          question: "Tell me about yourself and your professional journey.",
          context: "Icebreaker",
          skillType: "soft",
          difficulty: "easy",
          keyPoints: ["Background", "Experience", "Goals"],
          expectedApproach: "30-60 second pitch focused on relevance"
        },
        {
          question: "Why are you interested in this position?",
          context: "Motivation",
          skillType: "soft",
          difficulty: "easy",
          keyPoints: ["Company research", "Role fit", "Growth"],
          expectedApproach: "Show research and genuine interest"
        },
        {
          question: "What are your greatest strengths?",
          context: "Self-assessment",
          skillType: "soft",
          difficulty: "easy",
          keyPoints: ["Tech skills", "Soft skills", "Examples"],
          expectedApproach: "Give specific examples with impact"
        },
        {
          question: "What is an area where you want to improve?",
          context: "Growth mindset",
          skillType: "soft",
          difficulty: "easy",
          keyPoints: ["Honesty", "Action plan", "Learning"],
          expectedApproach: "Show self-awareness and growth"
        },
        {
          question: "Describe your ideal work environment.",
          context: "Culture fit",
          skillType: "soft",
          difficulty: "easy",
          keyPoints: ["Collaboration", "Tools", "Values"],
          expectedApproach: "Align with company culture"
        }
      ],
      soft_medium: [
        {
          question: "Tell me about a time you had to work with a difficult team member. How did you handle it?",
          context: "STAR format teamwork",
          skillType: "soft",
          difficulty: "medium",
          keyPoints: ["Conflict resolution", "Communication", "Outcome"],
          expectedApproach: "Use STAR method - Situation, Task, Action, Result"
        },
        {
          question: "Describe a project you led. What was your approach and what did you learn?",
          context: "Leadership",
          skillType: "soft",
          difficulty: "medium",
          keyPoints: ["Planning", "Execution", "Challenges"],
          expectedApproach: "Showcase decision-making"
        },
        {
          question: "How do you handle feedback and criticism?",
          context: "Adaptability",
          skillType: "soft",
          difficulty: "medium",
          keyPoints: ["Growth mindset", "Implementation", "Examples"],
          expectedApproach: "Show maturity and improvement"
        },
        {
          question: "Give an example of when you had to meet a tight deadline.",
          context: "Pressure management",
          skillType: "soft",
          difficulty: "medium",
          keyPoints: ["Planning", "Prioritization", "Results"],
          expectedApproach: "Demonstrate problem-solving"
        },
        {
          question: "How do you stay motivated and maintain work-life balance?",
          context: "Well-being",
          skillType: "soft",
          difficulty: "medium",
          keyPoints: ["Self-care", "Passion", "Sustainability"],
          expectedApproach: "Show long-term thinking"
        }
      ],
      soft_hard: [
        {
          question: "Describe a situation where you had to lead a team through a major setback. What did you do?",
          context: "Crisis management",
          skillType: "soft",
          difficulty: "hard",
          keyPoints: ["Leadership", "Resilience", "Communication"],
          expectedApproach: "Demonstrate executive presence"
        },
        {
          question: "How have you influenced company culture or team dynamics?",
          context: "Cultural impact",
          skillType: "soft",
          difficulty: "hard",
          keyPoints: ["Vision", "Influence", "Lasting change"],
          expectedApproach: "Show strategic thinking"
        },
        {
          question: "Tell me about a time you advocated for an unpopular idea that turned out to be right.",
          context: "Conviction and integrity",
          skillType: "soft",
          difficulty: "hard",
          keyPoints: ["Courage", "Data-driven", "Results"],
          expectedApproach: "Show conviction with humility"
        },
        {
          question: "How do you mentor and develop junior team members?",
          context: "Mentorship",
          skillType: "soft",
          difficulty: "hard",
          keyPoints: ["Coaching", "Growth", "Impact"],
          expectedApproach: "Show investment in others' success"
        },
        {
          question: "Describe how you've navigated a significant career pivot or challenge.",
          context: "Resilience",
          skillType: "soft",
          difficulty: "hard",
          keyPoints: ["Adaptability", "Learning", "Growth"],
          expectedApproach: "Demonstrate wisdom and perspective"
        }
      ],
      mixed_easy: [
        {
          question: "What's a recent project you're proud of? Describe both its technical and business impact.",
          context: "Mixed skills",
          skillType: "mixed",
          difficulty: "easy",
          keyPoints: ["Technical achievement", "Business value", "Team contribution"],
          expectedApproach: "Balance technical and soft skills discussion"
        },
        {
          question: "How do you balance learning new technologies with delivering product features?",
          context: "Growth and delivery",
          skillType: "mixed",
          difficulty: "easy",
          keyPoints: ["Learning", "Delivery", "Time management"],
          expectedApproach: "Show practical wisdom"
        },
        {
          question: "Describe your development workflow and why you've chosen it.",
          context: "Process and tools",
          skillType: "mixed",
          difficulty: "easy",
          keyPoints: ["Tools", "Methodology", "Efficiency"],
          expectedApproach: "Explain choices with reasoning"
        },
        {
          question: "How do you approach code reviews?",
          context: "Technical collaboration",
          skillType: "mixed",
          difficulty: "easy",
          keyPoints: ["Quality", "Learning", "Communication"],
          expectedApproach: "Show collaborative mindset"
        },
        {
          question: "Tell me about your involvement in technical interviews or hiring.",
          context: "Team contribution",
          skillType: "mixed",
          difficulty: "easy",
          keyPoints: ["Hiring sense", "Communication", "Company culture"],
          expectedApproach: "Show leadership potential"
        }
      ],
      mixed_medium: [
        {
          question: "How do you approach technical discussions with non-technical stakeholders?",
          context: "Cross-functional communication",
          skillType: "mixed",
          difficulty: "medium",
          keyPoints: ["Translation skills", "Empathy", "Influence"],
          expectedApproach: "Demonstrate communication mastery"
        },
        {
          question: "Describe how you've improved a system or process. What was your approach?",
          context: "System thinking",
          skillType: "mixed",
          difficulty: "medium",
          keyPoints: ["Analysis", "Implementation", "Impact"],
          expectedApproach: "Show strategic thinking"
        },
        {
          question: "How do you stay current with industry trends?",
          context: "Continuous learning",
          skillType: "mixed",
          difficulty: "medium",
          keyPoints: ["Learning habits", "Judgment", "Application"],
          expectedApproach: "Show intentional growth"
        },
        {
          question: "Tell me about a time you had to make a tradeoff between technical perfection and business needs.",
          context: "Pragmatism",
          skillType: "mixed",
          difficulty: "medium",
          keyPoints: ["Judgment", "Communication", "Results"],
          expectedApproach: "Show business acumen"
        },
        {
          question: "How do you ensure code quality while maintaining velocity?",
          context: "Engineering leadership",
          skillType: "mixed",
          difficulty: "medium",
          keyPoints: ["Testing", "Standards", "Automation"],
          expectedApproach: "Discuss practical solutions"
        }
      ],
      mixed_hard: [
        {
          question: "Describe your architecture thinking. How do you design scalable systems?",
          context: "System design philosophy",
          skillType: "mixed",
          difficulty: "hard",
          keyPoints: ["Scalability", "Maintainability", "Tradeoffs"],
          expectedApproach: "Show deep technical and strategic thinking"
        },
        {
          question: "How have you influenced technical direction or strategy at your organization?",
          context: "Leadership impact",
          skillType: "mixed",
          difficulty: "hard",
          keyPoints: ["Vision", "Influence", "Results"],
          expectedApproach: "Demonstrate executive perspective"
        },
        {
          question: "Tell me about your experience with different development methodologies and architectures.",
          context: "Breadth of experience",
          skillType: "mixed",
          difficulty: "hard",
          keyPoints: ["Agile", "Microservices", "Monolith"],
          expectedApproach: "Show nuanced understanding"
        },
        {
          question: "How do you build and maintain high-performing teams?",
          context: "Team leadership",
          skillType: "mixed",
          difficulty: "hard",
          keyPoints: ["Selection", "Development", "Culture"],
          expectedApproach: "Show people and technical leadership"
        },
        {
          question: "What's your vision for the role and how would you contribute to our engineering culture?",
          context: "Strategic fit",
          skillType: "mixed",
          difficulty: "hard",
          keyPoints: ["Vision", "Values", "Contribution"],
          expectedApproach: "Show genuine interest and strategic thinking"
        }
      ]
    };
    
    const key = `${type}_${level}`;
    const questions = questionBank[key] || questionBank.mixed_medium;
    return questions;
  };

  const handleSubmitAnswer = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimer(300);
    } else {
      evaluateAnswers();
    }
  };

  const evaluateAnswers = async () => {
    try {
      const response = await fetch('/api/ai/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers,
          userProfile,
          skillType,
          difficulty
        })
      });
      const evaluation = await response.json();
      setStage('feedback');
      setUserProfile(prev => ({
        ...prev,
        lastEvaluation: evaluation
      }));
    } catch (error) {
      console.error('Error evaluating:', error);
    }
  };

  // Landing Page
  if (stage === 'landing') {
    return (
      <div className="interview-landing">
        <div className="landing-hero">
          <h1>🚀 AI-Powered Interview Prep</h1>
          <p>Practice with personalized questions based on YOUR skills & projects</p>
          <div className="landing-stats">
            <div className="stat">
              <h3>📊 Adaptive</h3>
              <p>Questions tailored to your tech stack</p>
            </div>
            <div className="stat">
              <h3>🤖 AI-Powered</h3>
              <p>Real-time evaluation & feedback</p>
            </div>
            <div className="stat">
              <h3>📈 Track Progress</h3>
              <p>Improve your weak areas</p>
            </div>
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setStage('options')}
        >
          Get Started →
        </button>
      </div>
    );
  }

  // Options Page
  if (stage === 'options') {
    return (
      <div className="interview-options">
        <h2>Choose Your Interview Mode</h2>
        <div className="options-grid">
          <div className="option-card">
            <h3>🎯 Practice Mode</h3>
            <p>Practice with unlimited questions at your own pace</p>
            <button onClick={() => setStage('practice')}>Start Practice</button>
          </div>
          <div className="option-card">
            <h3>⚡ Mock Interview</h3>
            <p>Simulate a real interview with timer & evaluation</p>
            <button onClick={() => setStage('mock')}>Start Mock Interview</button>
          </div>
          <div className="option-card">
            <h3>💪 Skill Builder</h3>
            <p>Focus on hard skills or soft skills separately</p>
            <button onClick={() => setStage('practice')}>Choose Skills</button>
          </div>
          <div className="option-card">
            <h3>📚 Question Bank</h3>
            <p>Browse & filter questions by topic</p>
            <button onClick={() => setStage('practice')}>Explore</button>
          </div>
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => setStage('landing')}
        >
          ← Back
        </button>
      </div>
    );
  }

  // Practice/Mock Interview Mode
  if (stage === 'practice' || stage === 'mock') {
    if (loading) {
      return <div className="loading"><p>🔄 Generating personalized questions...</p></div>;
    }

    if (questions.length === 0) {
      return (
        <div className="interview-setup">
          <h2>Select Your Challenge</h2>
          <div className="setup-grid">
            <div className="setup-section">
              <h3>📊 Skill Type</h3>
              <div className="button-group">
                <button 
                  className={skillType === 'hard' ? 'active' : ''} 
                  onClick={() => setSkillType('hard')}
                >
                  💻 Hard Skills (Technical)
                </button>
                <button 
                  className={skillType === 'soft' ? 'active' : ''} 
                  onClick={() => setSkillType('soft')}
                >
                  🤝 Soft Skills
                </button>
                <button 
                  className={skillType === 'mixed' ? 'active' : ''} 
                  onClick={() => setSkillType('mixed')}
                >
                  🎪 Mixed
                </button>
              </div>
            </div>

            <div className="setup-section">
              <h3>📈 Difficulty Level</h3>
              <div className="button-group">
                <button 
                  className={difficulty === 'easy' ? 'active' : ''} 
                  onClick={() => setDifficulty('easy')}
                >
                  🟢 Easy
                </button>
                <button 
                  className={difficulty === 'medium' ? 'active' : ''} 
                  onClick={() => setDifficulty('medium')}
                >
                  🟡 Medium
                </button>
                <button 
                  className={difficulty === 'hard' ? 'active' : ''} 
                  onClick={() => setDifficulty('hard')}
                >
                  🔴 Hard
                </button>
              </div>
            </div>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => generateQuestions(skillType, difficulty)}
          >
            Generate Questions ✨
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setStage('options')}
          >
            ← Back
          </button>
        </div>
      );
    }

    return (
      <div className="interview-session">
        <div className="session-header">
          <div className="progress">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${((currentQuestion + 1) / questions.length) * 100}%`}}
              ></div>
            </div>
          </div>
          {stage === 'mock' && (
            <div className={`timer ${timer < 60 ? 'warning' : ''}`}>
              ⏱️ {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        <div className="question-container">
          <h3>Question {currentQuestion + 1}</h3>
          <p className="question-text">{questions[currentQuestion]?.question}</p>
          {questions[currentQuestion]?.context && (
            <div className="question-context">
              <strong>Context:</strong> {questions[currentQuestion].context}
            </div>
          )}
          <div className="question-tags">
            <span className="tag skills-tag">{questions[currentQuestion]?.skillType}</span>
            <span className="tag difficulty-tag">{questions[currentQuestion]?.difficulty}</span>
          </div>
        </div>

        <div className="answer-section">
          <label>Your Answer:</label>
          <textarea
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Type your answer here... (or speak your thoughts)"
            rows="6"
          />
          <div className="answer-actions">
            <button onClick={() => setIsRunning(!isRunning)}>
              {stage === 'mock' ? (isRunning ? '⏸ Pause' : '▶ Start') : ''}
            </button>
            <button className="btn-next" onClick={handleSubmitAnswer}>
              {currentQuestion === questions.length - 1 ? 'Finish & Evaluate' : 'Next Question →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Feedback & Evaluation Page
  if (stage === 'feedback') {
    const evaluation = userProfile?.lastEvaluation;
    return (
      <div className="interview-feedback">
        <h2>🎬 Interview Complete!</h2>
        
        <div className="score-card">
          <div className="score-circle">
            <h3>{evaluation?.overallScore || 0}/100</h3>
            <p>Overall Score</p>
          </div>
        </div>

        <div className="feedback-grid">
          <div className="feedback-section">
            <h3>💪 Strengths</h3>
            <ul>
              {evaluation?.strengths?.map((strength, idx) => (
                <li key={idx}>✓ {strength}</li>
              ))}
            </ul>
          </div>

          <div className="feedback-section">
            <h3>🎯 Areas to Improve</h3>
            <ul>
              {evaluation?.areasToImprove?.map((area, idx) => (
                <li key={idx}>• {area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="improvement-guide">
          <h3>📚 How to Improve (AI-Powered Suggestions)</h3>
          <div className="ai-suggestions">
            {evaluation?.improvementPlan?.map((step, idx) => (
              <div key={idx} className="suggestion-card">
                <h4>Step {idx + 1}: {step.title}</h4>
                <p>{step.description}</p>
                <ul className="resources">
                  {step.resources?.map((resource, ridx) => (
                    <li key={ridx}>• {resource}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="weak-areas-detailed">
          <h3>🔍 Detailed Analysis</h3>
          {evaluation?.detailedFeedback?.map((item, idx) => (
            <div key={idx} className="feedback-item">
              <h4>Q{idx + 1}: {item.question}</h4>
              <p><strong>Your Score:</strong> {item.score}/10</p>
              <p><strong>Feedback:</strong> {item.feedback}</p>
              <p><strong>Better approach:</strong> {item.suggestion}</p>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => {
            setStage('options');
            setQuestions([]);
          }}>
            Try Another Round
          </button>
          <button className="btn-secondary" onClick={() => setStage('landing')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }
};

export default InterviewPrep;