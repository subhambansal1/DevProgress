import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/CurrentLearning.css';

const CurrentLearning = () => {
  const [learning, setLearning] = useState({
    title: 'Advanced React Patterns',
    description: 'Master complex React patterns like render props, custom hooks, and performance optimization',
    startDate: '2026-03-15',
    targetDate: '2026-04-30',
    progress: 65,
    status: 'in-progress', // in-progress, completed, paused
    category: 'Frontend',
    icon: '⚛️',
    daysSpent: 29,
    dailyStreak: 15,
    currentDay: 15,
    totalDays: 46,
    notes: [
      {
        id: 1,
        date: '2026-04-12',
        title: 'Mastered useCallback & useMemo',
        content: 'Finally understood the performance optimization. Need to practice on large datasets.',
        tags: ['performance', 'hooks'],
        important: true,
      },
      {
        id: 2,
        date: '2026-04-10',
        title: 'Custom Hooks Deep Dive',
        content: 'Created 5 custom hooks. useLocalStorage, useWindowSize, useFetch, useAsync, useDebounce',
        tags: ['custom-hooks', 'practice'],
        important: false,
      },
      {
        id: 3,
        date: '2026-04-08',
        title: 'Render Props Pattern',
        content: 'Good explanation on render props vs component composition. Render props feels cleaner.',
        tags: ['patterns', 'concepts'],
        important: false,
      },
    ],
    notifications: [
      {
        id: 1,
        type: 'milestone',
        title: '🎉 15-Day Streak!',
        message: 'Great consistency! Keep it up',
        time: '2 hours ago',
        read: false,
      },
      {
        id: 2,
        type: 'reminder',
        title: '⏰ Time to Learn',
        message: 'Your daily learning session starts now',
        time: '4 hours ago',
        read: false,
      },
      {
        id: 3,
        type: 'progress',
        title: '📈 65% Progress',
        message: 'You are 65% through the learning path',
        time: 'Today',
        read: true,
      },
    ],
  });

  const [newNote, setNewNote] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [studyTime, setStudyTime] = useState(0);
  const [isStudyActive, setIsStudyActive] = useState(false);

  // Calculate days left
  const daysLeft = Math.ceil(
    (new Date(learning.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  // Study timer
  useEffect(() => {
    let interval;
    if (isStudyActive) {
      interval = setInterval(() => setStudyTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStudyActive]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const addNote = () => {
    if (!newNote.trim() || !newNoteTitle.trim()) return;

    const note = {
      id: learning.notes.length + 1,
      date: new Date().toISOString().split('T')[0],
      title: newNoteTitle,
      content: newNote,
      tags: [],
      important: false,
    };

    setLearning({
      ...learning,
      notes: [note, ...learning.notes],
    });
    setNewNote('');
    setNewNoteTitle('');
  };

  const toggleNotificationRead = (id) => {
    setLearning({
      ...learning,
      notifications: learning.notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      ),
    });
  };

  const updateProgress = (newProgress) => {
    setLearning({ ...learning, progress: Math.min(newProgress, 100) });
  };

  return (
    <main className="current-learning-page">
      {/* HEADER */}
      <motion.div
        className="cl-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="cl-title-wrap">
          <div className="cl-icon">{learning.icon}</div>
          <div>
            <h1>{learning.title}</h1>
            <p className="cl-category">
              {learning.category} • Day {learning.currentDay}/{learning.totalDays}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="cl-grid">
        {/* LEFT COLUMN */}
        <div className="cl-left">
          {/* STATS CARDS */}
          <div className="cl-stats-grid">
            <motion.div className="cl-stat-card" whileHover={{ y: -4 }}>
              <div className="stat-label">Days Left</div>
              <div className="stat-value" style={{ color: daysLeft > 7 ? '#10b981' : '#f59e0b' }}>
                {daysLeft}
              </div>
              <div className="stat-sub">Target: {new Date(learning.targetDate).toLocaleDateString()}</div>
            </motion.div>

            <motion.div className="cl-stat-card" whileHover={{ y: -4 }}>
              <div className="stat-label">Daily Streak 🔥</div>
              <div className="stat-value">{learning.dailyStreak}</div>
              <div className="stat-sub">Consecutive days</div>
            </motion.div>

            <motion.div className="cl-stat-card" whileHover={{ y: -4 }}>
              <div className="stat-label">Progress</div>
              <div className="stat-value">{learning.progress}%</div>
              <div className="stat-sub">Keep going!</div>
            </motion.div>

            <motion.div className="cl-stat-card" whileHover={{ y: -4 }}>
              <div className="stat-label">Days Spent</div>
              <div className="stat-value">{learning.daysSpent}</div>
              <div className="stat-sub">Total days invested</div>
            </motion.div>
          </div>

          {/* PROGRESS BAR */}
          <motion.div className="cl-card cl-progress-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="cl-card-header">
              <h3>Progress Overview</h3>
              <span className="progress-percent">{learning.progress}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${learning.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="progress-controls">
              <button onClick={() => updateProgress(learning.progress - 5)}>-5%</button>
              <button onClick={() => updateProgress(learning.progress + 5)}>+5%</button>
              <button onClick={() => updateProgress(100)}>Complete</button>
            </div>
          </motion.div>

          {/* DATE TIMELINE */}
          <motion.div className="cl-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h3>📅 Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot started"></div>
                <div>
                  <strong>Started</strong>
                  <p>{new Date(learning.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-item">
                <div className="timeline-dot progress"></div>
                <div>
                  <strong>Current ({learning.progress}%)</strong>
                  <p>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-item">
                <div className={`timeline-dot ${daysLeft <= 0 ? 'completed' : 'target'}`}></div>
                <div>
                  <strong>Target</strong>
                  <p>{new Date(learning.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STUDY TIMER */}
          <motion.div className="cl-card cl-timer-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3>⏱️ Today's Study Session</h3>
            <div className="timer-display">{formatTime(studyTime)}</div>
            <div className="timer-controls">
              <button
                className={`btn ${isStudyActive ? 'btn-pause' : 'btn-play'}`}
                onClick={() => setIsStudyActive(!isStudyActive)}
              >
                {isStudyActive ? '⏸ Pause' : '▶ Start'}
              </button>
              <button className="btn btn-reset" onClick={() => setStudyTime(0)}>
                🔄 Reset
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="cl-right">
          {/* NOTES SECTION */}
          <motion.div className="cl-card cl-notes-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h3>📝 Learning Notes</h3>
            <div className="note-input-wrap">
              <input
                type="text"
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="note-title-input"
              />
              <textarea
                placeholder="Write your notes here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="note-textarea"
                rows="3"
              />
              <button className="btn-add-note" onClick={addNote}>
                ➕ Add Note
              </button>
            </div>

            <div className="notes-list">
              {learning.notes.map((note) => (
                <motion.div key={note.id} className={`note-item ${note.important ? 'important' : ''}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="note-header">
                    <strong>{note.title}</strong>
                    <span className="note-date">{note.date}</span>
                  </div>
                  <p className="note-content">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.map((tag) => (
                        <span key={tag} className="note-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* NOTIFICATIONS */}
          <motion.div className="cl-card cl-notif-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3>🔔 Real-time Updates</h3>
            <div className="notif-list">
              {learning.notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => toggleNotificationRead(notif.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="notif-icon">{notif.type === 'milestone' ? '🎉' : notif.type === 'reminder' ? '⏰' : '📈'}</div>
                  <div className="notif-content">
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                    <span className="notif-time">{notif.time}</span>
                  </div>
                  <div className={`notif-badge ${notif.read ? 'read' : 'unread'}`}></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* DESCRIPTION */}
          <motion.div className="cl-card cl-desc-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>📚 About This Learning Path</h3>
            <p>{learning.description}</p>
            <div className="status-badge" style={{ background: learning.status === 'completed' ? '#10b981' : learning.status === 'paused' ? '#f59e0b' : '#3b82f6' }}>
              {learning.status.toUpperCase()}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default CurrentLearning;
