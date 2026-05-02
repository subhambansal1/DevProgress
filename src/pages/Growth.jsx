import "../styles/Growth.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getProfile } from "../utils/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Growth = () => {
  const [profile, setProfile] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const prof = await getProfile();
      setProfile(prof);

      // GitHub stats
      if (prof.github) {
        fetch(`http://localhost:5000/api/github/${prof.github}`)
          .then((r) => r.json())
          .then(setGithubStats);

        fetch(`https://api.github.com/users/${prof.github}/repos?per_page=100`)
          .then((r) => r.json())
          .then(setRepos);
      }

      // LeetCode stats
      if (prof.leetcode) {
        fetch(`http://localhost:5000/api/leetcode/${prof.leetcode}`)
          .then((r) => r.json())
          .then(setLeetcodeStats);
      }

      // Certificates count
      const email = localStorage.getItem("email");
      if (email) {
        fetch(`http://localhost:5000/api/certificate/${email}`)
          .then((r) => r.json())
          .then(setCerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // GitHub repos per month chart data
  const getRepoChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = new Array(12).fill(0);

    repos.forEach((repo) => {
      const month = new Date(repo.created_at).getMonth();
      const year = new Date(repo.created_at).getFullYear();
      if (year === new Date().getFullYear()) counts[month]++;
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Repos Created",
          data: counts,
          borderColor: "#ff2d2d",
          backgroundColor: "rgba(255,45,45,0.2)",
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#ff2d2d",
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "var(--text, #fff)" } },
    },
    scales: {
      x: {
        ticks: { color: "var(--text2, #aaa)" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "var(--text2, #aaa)" },
        grid: { color: "rgba(255,255,255,0.05)" },
        beginAtZero: true,
      },
    },
  };

  // Career progress calculate karo
  const calcProgress = () => {
    let score = 0;
    if (leetcodeStats?.totalSolved > 0) score += 25;
    if (leetcodeStats?.totalSolved > 100) score += 15;
    if (githubStats?.public_repos > 0) score += 20;
    if (githubStats?.public_repos > 10) score += 10;
    if (certs.length > 0) score += 15;
    if (certs.length > 3) score += 10;
    if (profile?.skills?.length > 0) score += 5;
    return Math.min(score, 100);
  };

  // Milestones generate karo real data se
  const getMilestones = () => {
    const milestones = [];

    if (profile?.createdAt) {
      milestones.push({
        text: "🚀 Started DevProgress",
        date: new Date(profile.createdAt).toLocaleDateString(),
      });
    }

    if (leetcodeStats?.totalSolved >= 50)
      milestones.push({ text: "⚡ Solved 50+ LeetCode Problems", date: "" });

    if (leetcodeStats?.totalSolved >= 100)
      milestones.push({ text: "🔥 Solved 100+ LeetCode Problems", date: "" });

    if (leetcodeStats?.totalSolved >= 300)
      milestones.push({ text: "💎 Solved 300+ LeetCode Problems", date: "" });

    if (githubStats?.public_repos >= 5)
      milestones.push({ text: "📁 Created 5+ GitHub Repos", date: "" });

    if (githubStats?.public_repos >= 20)
      milestones.push({ text: "🌟 20+ GitHub Repos", date: "" });

    if (certs.length >= 1)
      milestones.push({ text: "📜 First Certificate Earned", date: "" });

    if (certs.length >= 5)
      milestones.push({ text: "🏆 5+ Certificates Earned", date: "" });

    if (milestones.length === 0)
      milestones.push({ text: "🌱 Journey just started!", date: "" });

    return milestones;
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div style={{ color: "var(--text, #fff)", padding: "100px", textAlign: "center" }}>
        Loading growth data...
      </div>
    );
  }

  const progress = calcProgress();

  return (
    <motion.main
      className="growth-page"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
        <div className="gr-header">
          <h1>YOUR GROWTH</h1>
          <p>Real data. Real progress. 🚀</p>
        </div>

        {/* STATS ROW */}
        <div className="gr-stats-row">
          {[
            ["🔥", leetcodeStats?.totalSolved || "—", "Problems Solved"],
            ["⚡", leetcodeStats?.streak || "—", "Day Streak"],
            ["💻", githubStats?.public_repos || "—", "GitHub Repos"],
            ["📜", certs.length, "Certificates"],
            ["👥", githubStats?.followers || "—", "Followers"],
          ].map(([icon, val, label]) => (
            <motion.div
              key={label}
              className="gr-stat-card"
              whileHover={{ y: -4, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span className="gr-stat-icon">{icon}</span>
              <h2>{val}</h2>
              <p>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* CAREER PROGRESS */}
        <div className="gr-card gr-progress-card">
          <div className="gr-card-title">🎯 Career Progress</div>
          <div className="gr-progress-bar-wrap">
            <div
              className="gr-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="gr-progress-text">{progress}% — Keep going! 💪</p>
        </div>

        <div className="gr-main-grid">
          {/* CHART */}
          <div className="gr-card gr-card-large">
            <div className="gr-card-title">📈 GitHub Repos This Year</div>
            <div className="gr-chart-wrap">
              {repos.length > 0 ? (
                <Line data={getRepoChartData()} options={chartOptions} />
              ) : (
                <p style={{ color: "var(--text2, #aaa)" }}>
                  Add GitHub username in Profile to see chart
                </p>
              )}
            </div>
          </div>

          {/* SKILL GROWTH */}
          <div className="gr-side-column">
            <div className="gr-card">
              <div className="gr-card-title">🛠️ Your Skills</div>
              {profile?.skills?.length > 0 ? (
                profile.skills.map((skill, i) => (
                  <div className="gr-skill-row" key={i}>
                    <span>{skill}</span>
                    <div className="gr-skill-bar">
                      <div style={{ width: `${60 + (i * 7) % 40}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--text2, #aaa)", fontSize: 13 }}>
                  Add skills in Profile
                </p>
              )}
            </div>

            <div className="gr-card">
              <div className="gr-card-title">🎯 My Goals</div>
              <ul className="gr-timeline">
                {profile?.goals?.length > 0 ? (
                  profile.goals.map((goal, i) => (
                    <li key={i}>
                      <span className="dot" /> {goal}
                    </li>
                  ))
                ) : (
                  <li style={{ color: "var(--text2, #aaa)", fontSize: 13 }}>
                    Add goals in Profile
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* GITHUB HEATMAP */}
        {profile?.github && (
          <div className="gr-card gr-heatmap-card">
            <div className="gr-card-title">📅 GitHub Contributions</div>
            <div style={{ overflowX: "auto" }}>
              <GitHubCalendar username={profile.github} />
            </div>
          </div>
        )}

        {/* MILESTONES */}
        <div className="gr-lower-grid">
          <div className="gr-card">
            <div className="gr-card-title">🏆 Milestones</div>
            <ul className="gr-timeline">
              {getMilestones().map((m, i) => (
                <li key={i}>
                  <span className="dot" /> {m.text}
                  {m.date && <span style={{ color: "#888", fontSize: 11, marginLeft: 8 }}>{m.date}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="gr-card">
            <div className="gr-card-title">📊 Quick Stats</div>
            <div className="gr-stat-grid">
              <div className="gr-stat-box">{githubStats?.public_repos || 0} Repos</div>
              <div className="gr-stat-box">{leetcodeStats?.totalSolved || 0} Solved</div>
              <div className="gr-stat-box">{certs.length} Certs</div>
              <div className="gr-stat-box">{profile?.skills?.length || 0} Skills</div>
            </div>
          </div>

          <div className="gr-card gr-quote-card">
            <div className="gr-card-title">💬 Daily Quote</div>
            <p>"Discipline beats motivation every single day."</p>
          </div>
        </div>
      </motion.main>
    );
};

export default Growth;