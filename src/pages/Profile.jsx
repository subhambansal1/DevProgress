import "../styles/profile.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, logout as doLogout } from "../utils/auth";

const cardHover = {
  whileHover: { y: -4, scale: 1.01 },
  transition: { type: "spring", stiffness: 200, damping: 15 },
};

const normalizeLinkedInUsername = (value) => {
  if (!value) return "";
  return value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, "").replace(/\/?$/, "");
};

const normalizePortfolioUrl = (value) => {
  if (!value) return "";
  return value.match(/^https?:\/\//i) ? value : `https://${value}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    role: "Aspiring Software Developer",
    location: "",
    bio: "",
    avatar: "",
    github: "",
    linkedin: "",
    portfolio: "",
    leetcode: "",
    skills: [],
    goals: [],
    learning: [],
    education: [],
    experience: [],
  });

  const [editData, setEditData] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newLearning, setNewLearning] = useState("");
  const [newEducation, setNewEducation] = useState({ school: "", degree: "", field: "", year: "" });
  const [newExperience, setNewExperience] = useState({ company: "", role: "", duration: "", description: "" });

  const [githubStats, setGithubStats] = useState(null);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [certsCount, setCertsCount] = useState(0);

  const modalRef = useRef();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setEditOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const escHandler = (e) => { if (e.key === "Escape") setEditOpen(false); };
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      const sanitized = {
        name: data.name || "",
        role: data.role || "Aspiring Software Developer",
        location: data.location || "",
        bio: data.bio || "",
        avatar: data.avatar || "",
        github: data.github || "",
        linkedin: normalizeLinkedInUsername(data.linkedin || ""),
        portfolio: data.portfolio ? normalizePortfolioUrl(data.portfolio) : "",
        leetcode: data.leetcode || "",
        skills: data.skills || [],
        goals: data.goals || [],
        learning: data.learning || [],
        education: data.education || [],
        experience: data.experience || [],
      };
      console.log("📥 Profile loaded from API:", data);
      console.log("🎓 Education from API:", sanitized.education);
      console.log("💼 Experience from API:", sanitized.experience);
      setProfile(sanitized);
      setEditData(sanitized);

      // Load github stats
      if (sanitized.github) {
        fetch(`http://localhost:5000/api/github/${sanitized.github}`)
          .then(r => r.json()).then(setGithubStats);
      }

      // Load leetcode stats
      if (data.leetcode) {
        fetch(`http://localhost:5000/api/leetcode/${data.leetcode}`)
          .then(r => r.json()).then(setLeetcodeStats);
      }

      // Load certs count
      const email = localStorage.getItem("email");
      if (email) {
        fetch(`http://localhost:5000/api/certificate/${email}`)
          .then(r => r.json()).then(d => setCertsCount(d.length));
      }
    } catch (err) {
      console.error("❌ Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = {
        ...editData,
        linkedin: editData.linkedin
          ? editData.linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, "").replace(/\/?$/, "")
          : "",
        portfolio: editData.portfolio
          ? editData.portfolio.match(/^https?:\/\//i)
            ? editData.portfolio
            : `https://${editData.portfolio}`
          : "",
      };
      console.log("📤 Saving profile with normalized data:", normalized);
      const updated = await updateProfile(normalized);
      console.log("📥 Updated profile received:", updated);
      
      const sanitizedUpdated = {
        ...updated,
        linkedin: normalizeLinkedInUsername(updated.linkedin || ""),
        portfolio: updated.portfolio ? normalizePortfolioUrl(updated.portfolio) : "",
      };
      setProfile(sanitizedUpdated);
      setEditData(sanitizedUpdated);

      // Sync localStorage
      localStorage.setItem("profileName", updated.name);
      localStorage.setItem("github", updated.github);
      localStorage.setItem("leetcode", updated.leetcode);

      setEditOpen(false);
      showToast("✅ Profile saved!");
    } catch (err) {
      console.error("❌ Save error:", err);
      showToast("❌ Error saving profile: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAvatarUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Size check — 2MB se zyada nahi
  if (file.size > 2 * 1024 * 1024) {
    showToast("❌ Image 2MB se choti honi chahiye!");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setEditData({ ...editData, avatar: reader.result });
  };
  reader.readAsDataURL(file);
};

const syncGitHubAvatar = async (githubUsername) => {
  if (!githubUsername) return;
  try {
    const res = await fetch(`https://api.github.com/users/${githubUsername}`);
    const data = await res.json();
    if (data.avatar_url) {
      setEditData({ ...editData, avatar: data.avatar_url });
      showToast("✅ GitHub avatar synced!");
    }
  } catch (err) {
    console.log("Could not sync GitHub avatar");
  }
};
  const logout = () => {
    doLogout();
    navigate("/login");
  };

  if (loading) return (
    <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>
      Loading profile...
    </div>
  );

  return (
    <motion.div
      className="profile-root"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {toast && <div className="profile-toast">{toast}</div>}

      {/* HEADER */}
      <motion.div className="profile-header-card" {...cardHover}>
        <div className="profile-header-left">
          <div className="profile-avatar-wrapper">
            {profile.avatar ? (
              <img src={profile.avatar} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder"></div>
            )}
          </div>

          <div className="profile-header-text">
            <h1>{profile.name || "Developer"}</h1>
            <p>{profile.role}</p>
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" className="profile-link">
                🐙 {profile.github}
              </a>
            )}
            {profile.linkedin && (
              <a href={`https://www.linkedin.com/in/${profile.linkedin}`} target="_blank" className="profile-link">
                💼 LinkedIn
              </a>
            )}
            {profile.portfolio && (
              <a href={profile.portfolio.startsWith("http") ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" className="profile-link">
                🌐 Portfolio
              </a>
            )}
          </div>
        </div>

        <button className="profile-edit-btn" onClick={() => {
          console.log("Opening edit modal with profile:", profile);
          setEditData({ ...profile, education: profile?.education || [], experience: profile?.experience || [] });
          setEditOpen(true);
        }}>
          Edit Profile
        </button>
      </motion.div>

      {/* STATS */}
      <div className="profile-stats-row">
        <motion.div className="stat-tile" {...cardHover}>
          <h2>{leetcodeStats?.totalSolved || "—"}</h2>
          <p>Problems Solved</p>
        </motion.div>
        <motion.div className="stat-tile" {...cardHover}>
          <h2>{leetcodeStats?.streak || "—"}</h2>
          <p>Day Streak</p>
        </motion.div>
        <motion.div className="stat-tile" {...cardHover}>
          <h2>{githubStats?.public_repos || "—"}</h2>
          <p>Repos</p>
        </motion.div>
        <motion.div className="stat-tile" {...cardHover}>
          <h2>{certsCount}</h2>
          <p>Certifications</p>
        </motion.div>
      </div>

      {/* MAIN GRID */}
      <div className="profile-main-grid">
        <div className="profile-column">
          <motion.div className="profile-card" {...cardHover}>
            <h3>My Goals</h3>
            <ul>
              {profile.goals?.length > 0
                ? profile.goals.map((g, i) => <li key={i}>{g}</li>)
                : <li style={{ color: "#888" }}>No goals added yet</li>}
            </ul>
          </motion.div>

          <motion.div className="profile-card" {...cardHover}>
            <h3>Currently Learning</h3>
            <ul>
              {profile.learning?.length > 0
                ? profile.learning.map((l, i) => <li key={i}>{l}</li>)
                : <li style={{ color: "#888" }}>Nothing added yet</li>}
            </ul>
          </motion.div>
        </div>

        <div className="profile-column">
          <motion.div className="profile-card" {...cardHover}>
            <h3>Skills & Tech Stack</h3>
            <div className="skills-row">
              {profile.skills?.length > 0
                ? profile.skills.map((s, i) => (
                    <span key={i} className="skill-pill">{s}</span>
                  ))
                : <span style={{ color: "#888" }}>No skills added yet</span>}
            </div>
          </motion.div>

          <motion.div className="profile-card" {...cardHover}>
            <h3>GitHub Stats</h3>
            {githubStats ? (
              <div className="skills-row">
                <span className="skill-pill">⭐ {githubStats.public_repos} Repos</span>
                <span className="skill-pill">👥 {githubStats.followers} Followers</span>
                <span className="skill-pill">🌐 {githubStats.following} Following</span>
              </div>
            ) : (
              <p style={{ color: "#888" }}>Add GitHub username in Edit Profile</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* EDUCATION & EXPERIENCE */}
      <div className="profile-main-grid">
        {/* Education */}
        <motion.div className="profile-card" {...cardHover}>
          <h3>🎓 Education</h3>
          {console.log("Education state:", profile.education)}
          {profile.education && profile.education.length > 0 ? (
            <div className="profile-timeline">
              {profile.education.map((edu, i) => (
                <div key={i} className="profile-timeline-item">
                  <div className="profile-timeline-dot"></div>
                  <div className="profile-timeline-content">
                    <h4>{edu.degree} in {edu.field}</h4>
                    <p className="timeline-school">{edu.school}</p>
                    <span className="timeline-year">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#888" }}>No education added yet</p>
          )}
        </motion.div>

        {/* Experience & Internships */}
        <motion.div className="profile-card" {...cardHover}>
          <h3>💼 Experience & Internships</h3>
          {console.log("Experience state:", profile.experience)}
          {profile.experience && profile.experience.length > 0 ? (
            <div className="profile-timeline">
              {profile.experience.map((exp, i) => (
                <div key={i} className="profile-timeline-item">
                  <div className="profile-timeline-dot"></div>
                  <div className="profile-timeline-content">
                    <h4>{exp.role}</h4>
                    <p className="timeline-company">{exp.company}</p>
                    <p className="timeline-description">{exp.description}</p>
                    <span className="timeline-duration">{exp.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#888" }}>No experience added yet</p>
          )}
        </motion.div>
      </div>

      {/* FOOTER */}
      <motion.div className="profile-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button className="footer-btn logout" onClick={logout}>Logout</button>
      </motion.div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="edit-modal"
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="edit-modal-header">
                <h2>Edit Profile</h2>
                <button className="edit-modal-close" onClick={() => setEditOpen(false)}>✕</button>
              </div>

              <div className="edit-modal-content">
                {/* Avatar Section */}
                <div className="edit-section">
                  <label>Profile Photo</label>
                  <div className="avatar-upload-section">
                    {editData.avatar && <img src={editData.avatar} className="avatar-preview" />}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="avatar-input" />
                    {editData.github && <button className="sync-github-btn" onClick={() => syncGitHubAvatar(editData.github)}>🔄 Sync from GitHub</button>}
                    <p className="avatar-hint">Upload from device or sync from GitHub</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="edit-section">
                  <label>Full Name</label>
                  <input placeholder="Your full name" value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>

                <div className="edit-section">
                  <label>Role/Title</label>
                  <input placeholder="e.g., Software Developer" value={editData.role || ""} onChange={(e) => setEditData({ ...editData, role: e.target.value })} />
                </div>

                <div className="edit-section">
                  <label>Location</label>
                  <input placeholder="e.g., New York, USA" value={editData.location || ""} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
                </div>

                <div className="edit-section">
                  <label>Bio</label>
                  <textarea placeholder="Tell us about yourself..." value={editData.bio || ""} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} />
                </div>

                {/* Integrations */}
                <div className="edit-section">
                  <label>GitHub Username</label>
                  <input placeholder="e.g., theprince09" value={editData.github || ""} onChange={(e) => setEditData({ ...editData, github: e.target.value })} />
                </div>

                <div className="edit-section">
                  <label>LeetCode Username</label>
                  <input placeholder="e.g., theprince09" value={editData.leetcode || ""} onChange={(e) => setEditData({ ...editData, leetcode: e.target.value })} />
                </div>

                <div className="edit-section">
                  <label>LinkedIn Username</label>
                  <input placeholder="e.g., itsmeprince09" value={editData.linkedin || ""} onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })} />
                </div>

                <div className="edit-section">
                  <label>Portfolio URL</label>
                  <input placeholder="e.g., prince09.netlify.app" value={editData.portfolio || ""} onChange={(e) => setEditData({ ...editData, portfolio: e.target.value })} />
                </div>

                {/* Skills */}
                <div className="edit-section">
                  <label>Skills & Tech Stack</label>
                  <div className="edit-tags-container">
                    {editData.skills?.map((s, i) => (
                      <span key={i} className="skill-tag">
                        {s}
                        <button className="remove-tag" onClick={() => setEditData({ ...editData, skills: editData.skills.filter((_, j) => j !== i) })}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="edit-add-tag">
                    <input placeholder="Add skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
                    <button onClick={() => { if (newSkill && !editData.skills?.includes(newSkill)) { setEditData({ ...editData, skills: [...(editData.skills || []), newSkill] }); setNewSkill(""); } }}>Add</button>
                  </div>
                </div>

                {/* Goals */}
                <div className="edit-section">
                  <label>Goals</label>
                  <div className="edit-tags-container">
                    {editData.goals?.map((g, i) => (
                      <span key={i} className="skill-tag">
                        {g}
                        <button className="remove-tag" onClick={() => setEditData({ ...editData, goals: editData.goals.filter((_, j) => j !== i) })}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="edit-add-tag">
                    <input placeholder="Add goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
                    <button onClick={() => { if (newGoal && !editData.goals?.includes(newGoal)) { setEditData({ ...editData, goals: [...(editData.goals || []), newGoal] }); setNewGoal(""); } }}>Add</button>
                  </div>
                </div>

                {/* Learning */}
                <div className="edit-section">
                  <label>Currently Learning</label>
                  <div className="edit-tags-container">
                    {editData.learning?.map((l, i) => (
                      <span key={i} className="skill-tag">
                        {l}
                        <button className="remove-tag" onClick={() => setEditData({ ...editData, learning: editData.learning.filter((_, j) => j !== i) })}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="edit-add-tag">
                    <input placeholder="Add topic" value={newLearning} onChange={(e) => setNewLearning(e.target.value)} />
                    <button onClick={() => { if (newLearning && !editData.learning?.includes(newLearning)) { setEditData({ ...editData, learning: [...(editData.learning || []), newLearning] }); setNewLearning(""); } }}>Add</button>
                  </div>
                </div>

                {/* Education */}
                <div className="edit-section">
                  <label>🎓 Education</label>
                  <div className="edit-timeline-container">
                    {editData.education?.map((edu, i) => (
                      <div key={i} className="timeline-item">
                        <div className="edu-header">
                          <strong>{edu.degree} in {edu.field}</strong>
                          <span className="edu-year">{edu.year}</span>
                          <button className="remove-timeline-btn" onClick={() => setEditData({ ...editData, education: editData.education.filter((_, j) => j !== i) })}>✕</button>
                        </div>
                        <p className="edu-school">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                  <div className="edit-timeline-add">
                    <input placeholder="School/University" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} />
                    <input placeholder="Degree (e.g., B.Tech)" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
                    <input placeholder="Field of Study" value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} />
                    <input placeholder="Year (e.g., 2024)" value={newEducation.year} onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })} />
                    <button onClick={() => { if (newEducation.school && newEducation.degree && newEducation.field) { setEditData({ ...editData, education: [...(editData.education || []), newEducation] }); setNewEducation({ school: "", degree: "", field: "", year: "" }); } }}>Add Education</button>
                  </div>
                </div>

                {/* Experience / Internships */}
                <div className="edit-section">
                  <label>💼 Experience & Internships</label>
                  <div className="edit-timeline-container">
                    {editData.experience?.map((exp, i) => (
                      <div key={i} className="timeline-item">
                        <div className="exp-header">
                          <strong>{exp.role}</strong>
                          <span className="exp-duration">{exp.duration}</span>
                          <button className="remove-timeline-btn" onClick={() => setEditData({ ...editData, experience: editData.experience.filter((_, j) => j !== i) })}>✕</button>
                        </div>
                        <p className="exp-company">{exp.company}</p>
                        <p className="exp-description">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="edit-timeline-add">
                    <input placeholder="Company Name" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} />
                    <input placeholder="Job Title" value={newExperience.role} onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })} />
                    <input placeholder="Duration (e.g., Jun 2023 - Aug 2023)" value={newExperience.duration} onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })} />
                    <textarea placeholder="Brief description of role..." value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} />
                    <button onClick={() => { if (newExperience.company && newExperience.role && newExperience.duration) { setEditData({ ...editData, experience: [...(editData.experience || []), newExperience] }); setNewExperience({ company: "", role: "", duration: "", description: "" }); } }}>Add Experience</button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button className="cancel-btn" onClick={() => setEditOpen(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;