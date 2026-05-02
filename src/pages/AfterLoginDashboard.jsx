import "../styles/AfterLoginDashboard.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitHubCalendar } from "react-github-calendar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getProfile } from "../utils/auth";

const normalizeLinkedInUsername = (value) => {
  if (!value) return "";
  return value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, "").replace(/\/?$/, "");
};

const normalizePortfolioUrl = (value) => {
  if (!value) return "";
  return value.match(/^https?:\/\//i) ? value : `https://${value}`;
};

const cardHover = {
  whileHover: { y: -6, scale: 1.02 },
  transition: { type: "spring", stiffness: 200, damping: 15 },
};

const AfterLoginDashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [certs, setCerts] = useState([]);
  const [sortType, setSortType] = useState("new");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const prof = await getProfile();
      const normalizedProfile = {
        ...prof,
        linkedin: normalizeLinkedInUsername(prof.linkedin || ""),
        portfolio: normalizePortfolioUrl(prof.portfolio || ""),
      };
      setProfile(normalizedProfile);

      // Sync to localStorage
      if (normalizedProfile.github) localStorage.setItem("github", normalizedProfile.github);
      if (normalizedProfile.leetcode) localStorage.setItem("leetcode", normalizedProfile.leetcode);
      if (normalizedProfile.name) localStorage.setItem("profileName", normalizedProfile.name);

      if (normalizedProfile.github) {
        fetch(`http://localhost:5000/api/github/${normalizedProfile.github}`)
          .then(r => r.json()).then(setGithubStats);
        fetch(`https://api.github.com/users/${normalizedProfile.github}/repos?per_page=100`)
          .then(r => r.json()).then(data => Array.isArray(data) && setRepos(data));
      }

      if (prof.leetcode) {
        fetch(`http://localhost:5000/api/leetcode/${prof.leetcode}`)
          .then(r => r.json()).then(setLeetcodeStats);
      }

      const email = localStorage.getItem("email");
      if (email) {
        fetch(`http://localhost:5000/api/certificate/${email}`)
          .then(r => r.json()).then(data => Array.isArray(data) && setCerts(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedRepos = [...repos].sort((a, b) =>
    sortType === "new"
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
  );

  const isProfileIncomplete = !profile?.name || !profile?.role || !profile?.skills?.length || !profile?.leetcode;

  const leetcodeGraphData = [
    { name: "Easy", value: leetcodeStats?.easySolved || 0 },
    { name: "Medium", value: leetcodeStats?.mediumSolved || 0 },
    { name: "Hard", value: leetcodeStats?.hardSolved || 0 },
  ];

  // Career progress
  const calcProgress = () => {
    let s = 0;
    if (leetcodeStats?.totalSolved > 0) s += 20;
    if (leetcodeStats?.totalSolved > 100) s += 15;
    if (githubStats?.public_repos > 0) s += 20;
    if (githubStats?.public_repos > 10) s += 10;
    if (certs.length > 0) s += 20;
    if (profile?.skills?.length > 0) s += 10;
    if (profile?.education?.length > 0) s += 5;
    return Math.min(s, 100);
  };

  if (loading) return (
    <div style={{ color: "var(--text,#fff)", padding: "120px 40px", textAlign: "center", fontSize: 16 }}>
      Loading dashboard...
    </div>
  );

  const progress = calcProgress();

  return (
    <div className="dp-main-full">
      <div className="dp-energy-overlay" />

      <main className="dp-content">
        {/* HERO */}
        <section className="dp-hero">
          <div className="dp-hero-left">
            <p className="dp-greeting">Good day 👋</p>
            <h1>Welcome back, <span>{profile?.name || "Developer"}</span>!</h1>
            <p className="dp-subtitle">Keep pushing. Every commit counts. 🚀</p>
            <div className="dp-hero-actions">
              <button className="dp-primary-btn" onClick={() => navigate("/profile")}>Edit Profile</button>
              <button className="dp-secondary-btn" onClick={() => navigate("/resume")}>📄 Build Resume</button>
            </div>

            <div className="dp-social-links">
              <button className="dp-social-btn" onClick={() => profile?.github ? window.open(`https://github.com/${profile.github}`, "_blank") : navigate("/profile")}>🐙 GitHub</button>
              <button className="dp-social-btn" onClick={() => profile?.linkedin ? window.open(`https://www.linkedin.com/in/${profile.linkedin}`, "_blank") : navigate("/profile")}>🔗 LinkedIn</button>
              <button className="dp-social-btn" onClick={() => profile?.leetcode ? window.open(`https://leetcode.com/${profile.leetcode}`, "_blank") : navigate("/profile")}>⚡ LeetCode</button>
              <button className="dp-social-btn" onClick={() => profile?.portfolio ? window.open(profile.portfolio.startsWith("http") ? profile.portfolio : `https://${profile.portfolio}`, "_blank") : navigate("/profile")}>🌐 Portfolio</button>
            </div>
          </div>

          <div className="dp-profile-card">
            {githubStats?.avatar_url
              ? <img src={githubStats.avatar_url} className="avatar large" alt="avatar" />
              : <div className="avatar large placeholder">{profile?.name?.charAt(0) || "D"}</div>
            }
            <h3>{profile?.name || "Developer"}</h3>
            <p>{profile?.role || "Aspiring Developer"}</p>
            {profile?.github && <span>🐙 {profile.github}</span>}
            {profile?.leetcode && <span>⚡ {profile.leetcode}</span>}

            {/* Career Progress */}
            <div className="dp-mini-progress">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#aaa" }}>Career Progress</span>
                <span style={{ fontSize: 12, color: "#ff2d2d", fontWeight: 700 }}>{progress}%</span>
              </div>
              <div className="dp-progress-track">
                <div className="dp-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </section>

        {isProfileIncomplete && (
          <section className="dp-section dp-warning-banner">
            <div>
              <h2>Complete your profile to unlock the full experience</h2>
              <p>Set up your LinkedIn, LeetCode, and portfolio links so we can personalize your dashboard and resume.</p>
            </div>
            <button className="dp-primary-btn" onClick={() => navigate("/profile")}>Finish Profile Setup</button>
          </section>
        )}

        {/* STATS */}
        <section className="dp-stats">
          {[
            ["🔥", leetcodeStats?.totalSolved || "—", "Problems Solved"],
            ["⚡", leetcodeStats?.streak || "—", "Day Streak"],
            ["💻", githubStats?.public_repos || "—", "GitHub Repos"],
            ["👥", githubStats?.followers || "—", "Followers"],
            ["📜", certs.length, "Certificates"],
          ].map(([icon, num, label]) => (
            <motion.div key={label} className="dp-stat" {...cardHover}>
              <span className="dp-stat-icon">{icon}</span>
              <h2>{num}</h2>
              <p>{label}</p>
            </motion.div>
          ))}
        </section>

        {leetcodeStats && (
          <section className="dp-section">
            <div className="dp-section-header">
              <h2>LeetCode Problem Distribution</h2>
            </div>
            <div className="dp-card dp-chart-card">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={leetcodeGraphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", borderRadius: 12, border: "1px solid rgba(255,45,45,0.2)" }} />
                  <Line type="monotone" dataKey="value" stroke="#ff2d2d" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* GITHUB HEATMAP */}
        {profile?.github && (
          <section className="dp-section">
            <h2>GitHub Contributions</h2>
            <div className="dp-card" style={{ overflowX: "auto" }}>
              <GitHubCalendar username={profile.github} />
            </div>
          </section>
        )}

        {/* EDUCATION & EXPERIENCE JOURNEY */}
        {(profile?.education?.length > 0 || profile?.experience?.length > 0) && (
          <section className="dp-section">
            <h2>🛣️ Professional Journey</h2>
            <div className="dp-card">
              <div className="dp-journey-timeline">
                {/* Education Section */}
                {profile?.education?.length > 0 && (
                  <div className="journey-phase">
                    <h3 className="journey-phase-title">📚 Education</h3>
                    {profile.education.map((edu, i) => (
                      <motion.div key={`edu-${i}`} className="journey-item" {...cardHover}>
                        <div className="journey-marker">
                          <div className="journey-dot education-dot"></div>
                          <div className="journey-line"></div>
                        </div>
                        <div className="journey-content">
                          <h4>{edu.degree} in {edu.field}</h4>
                          <p className="journey-org">{edu.school}</p>
                          <span className="journey-date">{edu.year}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Experience Section */}
                {profile?.experience?.length > 0 && (
                  <div className="journey-phase">
                    <h3 className="journey-phase-title">💼 Professional Experience</h3>
                    {profile.experience.map((exp, i) => (
                      <motion.div key={`exp-${i}`} className="journey-item" {...cardHover}>
                        <div className="journey-marker">
                          <div className="journey-dot experience-dot"></div>
                          <div className="journey-line"></div>
                        </div>
                        <div className="journey-content">
                          <h4>{exp.role}</h4>
                          <p className="journey-org">{exp.company}</p>
                          <p className="journey-desc">{exp.description}</p>
                          <span className="journey-date">{exp.duration}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* REPOS */}
        {repos.length > 0 && (
          <section className="dp-section">
            <div className="dp-section-header">
              <h2>GitHub Projects</h2>
              <div className="dp-sort-btns">
                <button className={sortType === "new" ? "active" : ""} onClick={() => setSortType("new")}>Newest</button>
                <button className={sortType === "old" ? "active" : ""} onClick={() => setSortType("old")}>Oldest</button>
              </div>
            </div>
            <div className="dp-project-grid">
              {sortedRepos.slice(0, 6).map((repo) => (
                <motion.div key={repo.id} className="dp-card dp-repo-card" {...cardHover}>
                  <div className="repo-top">
                    <h3>{repo.name}</h3>
                    {repo.language && <span className="repo-lang">{repo.language}</span>}
                  </div>
                  {repo.description && <p className="repo-desc">{repo.description}</p>}
                  <div className="repo-stats">
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                  <a href={repo.html_url} target="_blank" className="repo-link">View on GitHub →</a>
                </motion.div>
              ))}
            </div>
            <a href={`https://github.com/${profile?.github}?tab=repositories`} target="_blank">
              <button className="dp-outline-btn" style={{ marginTop: 16 }}>See All Repos</button>
            </a>
          </section>
        )}

        {/* CERTIFICATES — Real */}
        <section className="dp-section">
          <div className="dp-section-header">
            <h2>My Certificates</h2>
            <button className="dp-outline-btn" onClick={() => navigate("/certificates")}>View All</button>
          </div>
          {certs.length > 0 ? (
            <div className="dp-cert-grid">
              {certs.slice(0, 4).map((cert) => (
                <motion.div key={cert._id} className="dp-card dp-cert-card" {...cardHover}>
                  <div className="cert-top">
                    <span className="cert-icon">🏆</span>
                    {cert.proctored && <span className="cert-badge">✔ Verified</span>}
                  </div>
                  <h3>{cert.title}</h3>
                  <p>{cert.issuer}</p>
                  <span className="cert-date">{cert.date}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="dp-card dp-empty-card">
              <p>No certificates yet. <span onClick={() => navigate("/certificates")} style={{ color: "#ff2d2d", cursor: "pointer" }}>Add your first one →</span></p>
            </div>
          )}
        </section>

        {/* QUICK LINKS */}
        <section className="dp-section">
          <h2>Quick Actions</h2>
          <div className="dp-quick-grid">
            {[
              { icon: "📄", label: "Build Resume", path: "/resume", desc: "AI-powered resume" },
              { icon: "🎯", label: "Interview Prep", path: "/interview", desc: "Practice questions" },
              { icon: "📈", label: "View Growth", path: "/growth", desc: "Your progress" },
              { icon: "👤", label: "Edit Profile", path: "/profile", desc: "Update your info" },
            ].map((item) => (
              <motion.div key={item.path} className="dp-card dp-quick-card" {...cardHover} onClick={() => navigate(item.path)}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AfterLoginDashboard;