import "../styles/Certificates.css";
import { useState, useEffect } from "react";

const Certificates = () => {
  const [certs, setCerts] = useState([]);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date: "",
    url: "",
    pdf: "",
    skills: "",
    proctored: false,
  });

  const [sort, setSort] = useState("new");
  const [filterProctored, setFilterProctored] = useState("all");

  const email = localStorage.getItem("email");
  const profileName = localStorage.getItem("profileName");
  const githubUser = localStorage.getItem("github");

  useEffect(() => {
    fetch(`http://localhost:5000/api/certificate/${email}`)
      .then((res) => res.json())
      .then((data) => setCerts(data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const uploadCertificate = async () => {
    const res = await fetch("http://localhost:5000/api/certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userEmail: email,
        ...form,
      }),
    });

    const data = await res.json();

    setCerts([...certs, data]);
  };

  const deleteCert = async (id) => {
    await fetch(`http://localhost:5000/api/certificate/${id}`, {
      method: "DELETE",
    });

    setCerts(certs.filter((c) => c._id !== id));
  };

  const generateSummary = (cert) => {
    return `This certificate from ${cert.issuer} demonstrates skills in ${cert.skills}. Completed on ${cert.date}.`;
  };

  const filtered = certs.filter((c) => {
    if (filterProctored === "all") return true;

    if (filterProctored === "yes") return c.proctored;

    if (filterProctored === "no") return !c.proctored;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "new") return new Date(b.date) - new Date(a.date);

    return new Date(a.date) - new Date(b.date);
  });

  return (
    <main className="certificates-page">
        <h1 className="cert-title">Certificates</h1>

        {/* Upload Card */}

        <div className="upload-card">
          <input
            placeholder="Certificate Name"
            name="title"
            onChange={handleChange}
          />
          <input placeholder="Issuer" name="issuer" onChange={handleChange} />
          <input type="date" name="date" onChange={handleChange} />
          <input
            placeholder="Certificate URL"
            name="url"
            onChange={handleChange}
          />
          <input placeholder="PDF URL" name="pdf" onChange={handleChange} />
          <input
            placeholder="Skills (Java,React)"
            name="skills"
            onChange={handleChange}
          />

          <label className="checkbox">
            <input type="checkbox" name="proctored" onChange={handleChange} />
            Proctored Exam
          </label>

          <button onClick={uploadCertificate}>Upload</button>
        </div>

        {/* Filters */}

        <div className="cert-controls">
          <select onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
          </select>

          <select onChange={(e) => setFilterProctored(e.target.value)}>
            <option value="all">All</option>
            <option value="yes">Proctored</option>
            <option value="no">Non-Proctored</option>
          </select>
        </div>

        {/* Certificates Grid */}

        <div className="cert-grid">
          {sorted.map((cert) => (
            <div className="cert-card" key={cert._id}>
              <h3>{cert.title}</h3>

              <p className="issuer">{cert.issuer}</p>

              <p className="date">{cert.date}</p>

              {/* Verification */}

              {cert.proctored ? (
                <span className="badge verified">✔ Verified</span>
              ) : (
                <span className="badge unverified">Unverified</span>
              )}

              {/* Skills */}

              <div className="skills">
                {cert.skills?.split(",").map((skill) => (
                  <span key={skill} className="skill">
                    {skill}
                  </span>
                ))}
              </div>

              {/* AI Summary */}

              <p className="ai-summary">🤖 {generateSummary(cert)}</p>

              {/* Actions */}

              <div className="cert-actions">
                <button onClick={() => window.open(cert.url)}>View</button>

                <button onClick={() => setPreview(cert.pdf)}>
                  PDF Preview
                </button>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${cert.url}`}
                  target="_blank"
                >
                  <button className="linkedin">Share</button>
                </a>

                <button className="delete" onClick={() => deleteCert(cert._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PDF PREVIEW MODAL */}

        {preview && (
          <div className="pdf-modal">
            <div className="pdf-box">
              <iframe src={preview} title="pdf" />

              <button onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        )}

        {/* TIMELINE */}

        <h2 className="timeline-title">Certificate Timeline</h2>

        <div className="timeline">
          {sorted.map((cert) => (
            <div className="timeline-item" key={cert._id}>
              <span className="dot"></span>

              <div className="timeline-content">
                <h4>{cert.title}</h4>

                <p>{cert.issuer}</p>

                <span>{cert.date}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
};

export default Certificates;
