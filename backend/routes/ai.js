const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant inside DevProgress — a developer progress tracking app. 
          Help the user with coding, DSA, projects, GitHub, LeetCode, and career advice. 
          Be concise and friendly. Reply in the same language the user writes in.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "Kuch samajh nahi aaya, dobara puchho!";
    res.json({ reply });

  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ reply: "AI se connect nahi ho pa raha, try again!" });
  }
});

// Generate personalized interview questions
router.post("/generate-interview-questions", async (req, res) => {
  try {
    const { userProfile, type, difficulty, count } = req.body;

    // Build context from user profile
    const technologies = userProfile?.technologies || [];
    const projects = userProfile?.projects || [];
    const skills = userProfile?.skills || [];
    const experience = userProfile?.experience || "fresher";

    const skillTypeDescriptions = {
      hard: "technical/coding skills",
      soft: "soft skills like communication, teamwork, leadership",
      mixed: "both technical and soft skills"
    };

    const difficultyDescriptions = {
      easy: "beginner level",
      medium: "intermediate level",
      hard: "advanced level"
    };

    const prompt = `Generate ${count} interview questions for a developer with the following profile:
    
Technologies & Stack: ${technologies.join(", ") || "Full-stack development"}
Recent Projects: ${projects.slice(0, 3).join(", ") || "Multiple projects"}
Skills: ${skills.join(", ") || "General programming"}
Experience Level: ${experience}

Generate ${count} ${skillTypeDescriptions[type]} interview questions at ${difficultyDescriptions[difficulty]} difficulty.

Expected Response Format: Return a JSON array of objects with this exact structure:
[
  {
    "question": "The interview question here",
    "context": "Brief context or scenario if applicable",
    "skillType": "${type}",
    "difficulty": "${difficulty}",
    "keyPoints": ["point1", "point2", "point3"],
    "expectedApproach": "Brief description of how to approach this"
  }
]

Make questions practical, relevant to their tech stack, and aligned with their GitHub projects. Include real-world scenarios.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert interview coach and technical interviewer. Generate personalized interview questions based on a developer's profile, skills, and experience. Always respond with valid JSON only.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    let questions = [];
    
    if (jsonMatch) {
      try {
        questions = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("JSON parse error:", e);
        questions = generateFallbackQuestions(type, difficulty, count, technologies);
      }
    } else {
      questions = generateFallbackQuestions(type, difficulty, count, technologies);
    }

    res.json({ questions });

  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Evaluate interview performance
router.post("/evaluate-interview", async (req, res) => {
  try {
    const { questions, answers, userProfile, skillType, difficulty } = req.body;

    const evaluationPrompt = `Evaluate this interview performance:

User Profile:
- Technologies: ${userProfile?.technologies?.join(", ")}
- Projects: ${userProfile?.projects?.slice(0, 3).join(", ")}
- Skills: ${userProfile?.skills?.join(", ")}

Questions and Answers:
${questions.map((q, i) => `
Q${i + 1}: ${q.question}
Answer: ${answers[i] || "No answer provided"}
`).join("\n")}

Provide a comprehensive evaluation in this JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "detailedFeedback": [
    {
      "question": "Q1 text",
      "score": <0-10>,
      "feedback": "Specific feedback",
      "suggestion": "How to improve"
    }
  ],
  "improvementPlan": [
    {
      "title": "Concept to learn",
      "description": "Why this matters",
      "resources": ["resource1", "resource2"]
    }
  ],
  "nextSteps": ["step1", "step2", "step3"]
}

Be constructive but honest. Focus on actionable improvements specific to their tech stack and projects.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer and career coach. Evaluate interview responses fairly and provide constructive feedback based on the candidate's skills and experience level. Always respond with valid JSON only.`,
        },
        {
          role: "user",
          content: evaluationPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let evaluation = {};
    
    if (jsonMatch) {
      try {
        evaluation = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("JSON parse error:", e);
        evaluation = generateFallbackEvaluation(questions, answers);
      }
    } else {
      evaluation = generateFallbackEvaluation(questions, answers);
    }

    res.json(evaluation);

  } catch (err) {
    console.error("Error evaluating interview:", err);
    res.status(500).json({ error: "Failed to evaluate interview" });
  }
});

// Fallback question generator
function generateFallbackQuestions(type, difficulty, count, technologies) {
  const hardSkillsEasy = [
    {
      question: "Explain what a React Hook is and why would you use it?",
      context: "In the context of modern React development",
      skillType: "hard",
      difficulty: "easy",
      keyPoints: ["State management", "Side effects", "Reusability"],
      expectedApproach: "Explain Hook concept and provide practical examples"
    },
    {
      question: "What is the difference between var, let, and const in JavaScript?",
      context: "JavaScript variable declarations",
      skillType: "hard",
      difficulty: "easy",
      keyPoints: ["Scope", "Hoisting", "Reassignment"],
      expectedApproach: "Compare scope, hoisting behavior, and use cases"
    },
    {
      question: "How would you debug a performance issue in your application?",
      context: "General debugging approach",
      skillType: "hard",
      difficulty: "easy",
      keyPoints: ["Profiling", "Identifying bottlenecks", "Tools"],
      expectedApproach: "Describe systematic debugging approach"
    }
  ];

  const softSkillsEasy = [
    {
      question: "Tell me about a time you had to work with a difficult team member.",
      context: "Team collaboration scenario",
      skillType: "soft",
      difficulty: "easy",
      keyPoints: ["Communication", "Empathy", "Resolution"],
      expectedApproach: "Use STAR method (Situation, Task, Action, Result)"
    },
    {
      question: "How do you handle tight deadlines?",
      context: "Time management and stress handling",
      skillType: "soft",
      difficulty: "easy",
      keyPoints: ["Organization", "Prioritization", "Communication"],
      expectedApproach: "Share real example with positive outcome"
    }
  ];

  let selectedQuestions = type === 'hard' ? hardSkillsEasy : softSkillsEasy;
  return selectedQuestions.slice(0, count);
}

// Fallback evaluation generator
function generateFallbackEvaluation(questions, answers) {
  const answerCount = answers.filter(a => a && a.trim().length > 0).length;
  const completionRate = (answerCount / questions.length) * 100;

  return {
    overallScore: Math.min(90, 60 + (completionRate * 0.3)),
    strengths: [
      "Demonstrated understanding of core concepts",
      "Provided practical examples",
      "Clear communication of ideas"
    ],
    areasToImprove: [
      "Expand on technical depth",
      "Include more real-world examples",
      "Focus on problem-solving approach"
    ],
    detailedFeedback: questions.map((q, i) => ({
      question: q.question,
      score: answers[i] && answers[i].trim().length > 50 ? 7 : 5,
      feedback: answers[i] ? "Good attempt, could be more detailed" : "Consider providing more detail",
      suggestion: "Add specific examples and explain your thought process"
    })),
    improvementPlan: [
      {
        title: "System Design Concepts",
        description: "Master scalability and architecture patterns",
        resources: ["System Design Primer", "LeetCode System Design"]
      },
      {
        title: "Behavioral Skills",
        description: "Improve communication and team collaboration",
        resources: ["Cracking the PM Interview", "STAR method practice"]
      }
    ],
    nextSteps: ["Practice one system design problem daily", "Record mock interviews", "Review feedback weekly"]
  };
}

module.exports = router;