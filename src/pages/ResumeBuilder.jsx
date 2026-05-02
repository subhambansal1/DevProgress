import { useState, useEffect, useRef } from "react";
import { getProfile } from "../utils/auth";
import { motion } from "framer-motion";
import "../styles/ResumeBuilder.css";

const ResumeBuilder = () => {
  const [profile, setProfile] = useState(null);
  const [certs, setCerts] = useState([]);
  const [repos, setRepos] = useState([]);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState(null);
  const resumeRef = useRef();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const prof = await getProfile();
      setProfile(prof);

      const email = localStorage.getItem("email");
      if (email) {
        const c = await fetch(`http://localhost:5000/api/certificate/${email}`).then(r => r.json());
        if (Array.isArray(c)) setCerts(c);
      }

      if (prof.github) {
        const r = await fetch(`https://api.github.com/users/${prof.github}/repos?per_page=100&sort=stars`).then(r => r.json());
        if (Array.isArray(r)) setRepos(r.slice(0, 6));
      }

      if (prof.leetcode) {
        const l = await fetch(`http://localhost:5000/api/leetcode/${prof.leetcode}`).then(r => r.json());
        setLeetcodeStats(l);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateResume = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a professional resume in JSON format for this developer:

Name: ${profile?.name || "Developer"}
Role: ${profile?.role || "Software Developer"}
Location: ${profile?.location || ""}
Bio: ${profile?.bio || ""}
Email: ${localStorage.getItem("email") || ""}
GitHub: ${profile?.github || ""}
LinkedIn: ${profile?.linkedin || ""}
Portfolio: ${profile?.portfolio || ""}
LeetCode: ${profile?.leetcode || ""}

Skills: ${profile?.skills?.join(", ") || "Not specified"}
Goals: ${profile?.goals?.join(", ") || ""}
Currently Learning: ${profile?.learning?.join(", ") || ""}

LeetCode Stats:
- Total Solved: ${leetcodeStats?.totalSolved || 0}
- Easy: ${leetcodeStats?.easySolved || 0}
- Medium: ${leetcodeStats?.mediumSolved || 0}
- Hard: ${leetcodeStats?.hardSolved || 0}

Top GitHub Projects:
${repos.map(r => `- ${r.name}: ${r.description || "No description"} (${r.language || "Code"}, ⭐${r.stargazers_count})`).join("\n")}

Certificates:
${certs.map(c => `- ${c.title} by ${c.issuer} (${c.date})`).join("\n")}

Education:
${profile?.education?.map(e => `- ${e.degree} in ${e.field} from ${e.school} (${e.year})`).join("\n") || "Not specified"}

Experience:
${profile?.experience?.map(e => `- ${e.role} at ${e.company} (${e.duration}): ${e.description}`).join("\n") || "Not specified"}

Return ONLY a JSON object with this structure (no markdown, no backticks):
{
  "summary": "2-3 line professional summary",
  "experience": [{"role":"","company":"","duration":"","points":["",""]}],
  "education": [{"degree":"","school":"","year":"","grade":""}],
  "skills": {"languages":[],"frameworks":[],"tools":[],"other":[]},
  "projects": [{"name":"","tech":"","description":"","link":""}],
  "certificates": [{"name":"","issuer":"","date":""}],
  "achievements": [""]
}`;

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      let text = data.reply;

      // JSON extract karo
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setResume(parsed);
      }
    } catch (err) {
      console.error("Resume generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const printResume = () => {
    window.print();
  };

  if (loading) return (
    <div style={{ padding: "120px 40px", color: "var(--text,#fff)", textAlign: "center" }}>
      Loading your data...
    </div>
  );

  return (
    <div className="resume-root">
      <div className="resume-container">

        {/* LEFT — Controls */}
        <div className="resume-controls">
          <h1>📄 Resume Builder</h1>
          <p className="resume-subtitle">AI generates your resume from your real data</p>

          {/* Data Summary */}
          <div className="resume-data-card">
            <h3>📊 Your Data</h3>
            <div className="resume-data-grid">
              <div className="resume-data-item">
                <span>{profile?.skills?.length || 0}</span>
                <p>Skills</p>
              </div>
              <div className="resume-data-item">
                <span>{repos.length}</span>
                <p>Projects</p>
              </div>
              <div className="resume-data-item">
                <span>{certs.length}</span>
                <p>Certificates</p>
              </div>
              <div className="resume-data-item">
                <span>{leetcodeStats?.totalSolved || 0}</span>
                <p>LC Solved</p>
              </div>
            </div>
          </div>

          {/* Profile completeness */}
          <div className="resume-data-card">
            <h3>✅ Profile Status</h3>
            {[
              ["Name", !!profile?.name],
              ["Role", !!profile?.role],
              ["Skills", profile?.skills?.length > 0],
              ["GitHub", !!profile?.github],
              ["LeetCode", !!profile?.leetcode],
              ["Education", profile?.education?.length > 0],
              ["Experience", profile?.experience?.length > 0],
              ["Certificates", certs.length > 0],
            ].map(([label, done]) => (
              <div key={label} className="resume-check-item">
                <span className={done ? "check-done" : "check-missing"}>
                  {done ? "✓" : "○"}
                </span>
                <span style={{ color: done ? "var(--text,#fff)" : "#666" }}>{label}</span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
              Add missing data in Profile for a better resume
            </p>
          </div>

          <button
            className="resume-generate-btn"
            onClick={generateResume}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="btn-spinner" />
                Generating...
              </>
            ) : (
              "✨ Generate Resume"
            )}
          </button>

          {resume && (
            <button className="resume-print-btn" onClick={printResume}>
              🖨️ Print / Save PDF
            </button>
          )}
        </div>

        {/* RIGHT — Resume Preview */}
        <div className="resume-preview-wrap">
          {!resume && !generating && (
            <div className="resume-empty">
              <div className="resume-empty-icon">📄</div>
              <h3>Your resume will appear here</h3>
              <p>Click "Generate Resume" to create your AI-powered resume from your profile data</p>
            </div>
          )}

          {generating && (
            <div className="resume-empty">
              <div className="resume-loading-dots">
                <span /><span /><span />
              </div>
              <h3>AI is building your resume...</h3>
              <p>Analyzing your GitHub, LeetCode, certificates and profile data</p>
            </div>
          )}

          {resume && !generating && (
            <motion.div
              className="resume-paper"
              ref={resumeRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* HEADER */}
              <div className="rp-header">
                <div>
                  <h1>{profile?.name || "Developer"}</h1>
                  <p className="rp-role">{profile?.role}</p>
                  <div className="rp-contact">
                    {localStorage.getItem("email") && <span>✉ {localStorage.getItem("email")}</span>}
                    {profile?.github && <span>🐙 github.com/{profile.github}</span>}
                    {profile?.location && <span>📍 {profile.location}</span>}
                    {profile?.leetcode && <span>⚡ leetcode.com/{profile.leetcode}</span>}
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              {resume.summary && (
                <div className="rp-section">
                  <h2>Summary</h2>
                  <p>{resume.summary}</p>
                </div>
              )}

              {/* SKILLS */}
              {resume.skills && (
                <div className="rp-section">
                  <h2>Technical Skills</h2>
                  <div className="rp-skills-grid">
                    {resume.skills.languages?.length > 0 && (
                      <div><strong>Languages:</strong> {resume.skills.languages.join(", ")}</div>
                    )}
                    {resume.skills.frameworks?.length > 0 && (
                      <div><strong>Frameworks:</strong> {resume.skills.frameworks.join(", ")}</div>
                    )}
                    {resume.skills.tools?.length > 0 && (
                      <div><strong>Tools:</strong> {resume.skills.tools.join(", ")}</div>
                    )}
                    {resume.skills.other?.length > 0 && (
                      <div><strong>Other:</strong> {resume.skills.other.join(", ")}</div>
                    )}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {resume.experience?.length > 0 && (
                <div className="rp-section">
                  <h2>Experience</h2>
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="rp-item">
                      <div className="rp-item-header">
                        <strong>{exp.role}</strong>
                        <span>{exp.duration}</span>
                      </div>
                      <p className="rp-company">{exp.company}</p>
                      <ul>
                        {exp.points?.map((p, j) => <li key={j}>{p}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* PROJECTS */}
              {resume.projects?.length > 0 && (
                <div className="rp-section">
                  <h2>Projects</h2>
                  {resume.projects.map((proj, i) => (
                    <div key={i} className="rp-item">
                      <div className="rp-item-header">
                        <strong>{proj.name}</strong>
                        <span className="rp-tech">{proj.tech}</span>
                      </div>
                      <p>{proj.description}</p>
                      {proj.link && <a href={proj.link} className="rp-link">{proj.link}</a>}
                    </div>
                  ))}
                </div>
              )}

              {/* EDUCATION */}
              {resume.education?.length > 0 && (
                <div className="rp-section">
                  <h2>Education</h2>
                  {resume.education.map((edu, i) => (
                    <div key={i} className="rp-item">
                      <div className="rp-item-header">
                        <strong>{edu.degree}</strong>
                        <span>{edu.year}</span>
                      </div>
                      <p className="rp-company">{edu.school}</p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* CERTIFICATES */}
              {resume.certificates?.length > 0 && (
                <div className="rp-section">
                  <h2>Certificates</h2>
                  <div className="rp-cert-list">
                    {resume.certificates.map((cert, i) => (
                      <div key={i} className="rp-cert-item">
                        <strong>{cert.name}</strong>
                        <span>{cert.issuer} — {cert.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACHIEVEMENTS */}
              {resume.achievements?.length > 0 && (
                <div className="rp-section">
                  <h2>Achievements</h2>
                  <ul>
                    {resume.achievements.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .resume-controls { display: none !important; }
          .resume-preview-wrap { width: 100% !important; }
          .resume-paper {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            color: #000 !important;
            background: #fff !important;
          }
          .resume-root { background: #fff !important; }
          .rp-header { background: #fff !important; color: #000 !important; }
          .rp-header h1 { color: #000 !important; }
          .rp-section h2 { color: #cc0000 !important; }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;