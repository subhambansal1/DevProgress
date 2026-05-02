import "../styles/Projects.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { GitHubCalendar } from "react-github-calendar";

const Projects = () => {
  const navigate = useNavigate();

  const profileName = localStorage.getItem("profileName");
  const githubUser = localStorage.getItem("github");

  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");

  const [filter, setFilter] = useState("All");
  const [sortType, setSortType] = useState("new");
  const [year, setYear] = useState("All");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!githubUser) return;

    fetch(`https://api.github.com/users/${githubUser}/repos`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((repo) => ({
          id: repo.id.toString(),
          name: repo.name,
          status: "In Progress",
          progress: Math.floor(Math.random() * 60) + 20,
          language: repo.language || "Code",
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          year: new Date(repo.created_at).getFullYear(),

          summary: `AI: ${repo.name} is built using ${repo.language || "multiple technologies"} and hosted on GitHub.`,

          commits: [
            { value: 2 },
            { value: 5 },
            { value: 3 },
            { value: 8 },
            { value: 6 },
          ],
        }));

        setProjects(mapped);
      });
  }, [githubUser]);

  const toggleStatus = (id) => {
    setProjects(
      projects.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "Completed" ? "In Progress" : "Completed",
            }
          : p,
      ),
    );
  };

  const deleteProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const addProject = () => {
    if (!title) return;

    const newProject = {
      id: Date.now().toString(),
      name: title,
      status: "In Progress",
      progress: 0,
      language: "Custom",
      url: "#",
      stars: 0,
      forks: 0,
      year: new Date().getFullYear(),
      summary: "AI: Custom project created by user.",
      commits: [{ value: 2 }, { value: 4 }, { value: 3 }],
    };

    setProjects([...projects, newProject]);
    setTitle("");
  };

  const filtered = projects.filter((p) => {
    if (filter !== "All" && p.status !== filter) return false;

    if (year !== "All" && p.year.toString() !== year) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortType === "new") return b.year - a.year;

    return a.year - b.year;
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = [...projects];
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setProjects(items);
  };

  const commitsTotal = projects.length * 10;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed",
  ).length;
  const streak = Math.floor(Math.random() * 40) + 10;

  return (
    <main className="projects-page">
        <h1 className="proj-title">Projects</h1>

        {/* CONTROLS */}

        <div className="proj-controls">
          <div className="proj-add">
            <input
              placeholder="New project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <button onClick={addProject}>Add</button>
          </div>

          <div className="proj-filters">
            <select onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <select onChange={(e) => setSortType(e.target.value)}>
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
            </select>

            <select onChange={(e) => setYear(e.target.value)}>
              <option>All</option>
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
            </select>
          </div>
        </div>

        {/* HEATMAP */}

        <div className="proj-heatmap">
          <h2>GitHub Activity</h2>

          <div className="heatmap-scroll">
            <GitHubCalendar username={githubUser} />
          </div>
        </div>

        {/* HORIZONTAL ANALYTICS */}

        <div className="dev-analytics-bar">
          <div className="analytics-card">
            <h3>{commitsTotal}</h3>
            <p>GitHub Commits</p>
          </div>

          <div className="analytics-card">
            <h3>{completedProjects}</h3>
            <p>Projects Completed</p>
          </div>

          <div className="analytics-card">
            <h3>{streak}</h3>
            <p>Project Streak</p>
          </div>

          <div className="analytics-card">
            <h3>{projects.length}</h3>
            <p>GitHub Activity</p>
          </div>
        </div>

        {/* PROJECT GRID */}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div
                className="proj-grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {sorted.map((project, index) => (
                  <Draggable
                    key={project.id}
                    draggableId={project.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="proj-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <h3>{project.name}</h3>

                        <div className="repo-analytics">
                          <span>⭐ {project.stars}</span>
                          <span>🍴 {project.forks}</span>
                          <span className="badge">{project.language}</span>
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: project.progress + "%" }}
                          />
                        </div>

                        <p className="progress-text">
                          {project.progress}% complete
                        </p>

                        <div className="commit-graph">
                          <ResponsiveContainer width="100%" height={80}>
                            <LineChart data={project.commits}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="ai-summary">{project.summary}</div>

                        <div className="proj-actions">
                          <button onClick={() => toggleStatus(project.id)}>
                            Toggle Status
                          </button>

                          <a href={project.url} target="_blank">
                            <button className="github-btn">GitHub</button>
                          </a>

                          <button
                            className="delete-btn"
                            onClick={() => deleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>
    );
};

export default Projects;
