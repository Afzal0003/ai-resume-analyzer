import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [apiMessage, setApiMessage] = useState("Checking backend...");
  const [apiStatus, setApiStatus] = useState("pending");
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMessage, setUploadMessage] = useState("No file uploaded yet.");
  const [analysisMessage, setAnalysisMessage] = useState(
    "Resume analysis preview has not started."
  );
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/");
        const data = await response.json();
        setApiMessage(data.message);
        setApiStatus("success");
      } catch (error) {
        setApiMessage("Backend connection failed");
        setApiStatus("error");
      }
    };

    fetchHealth();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/analysis/history");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        setHistory([]);
      }
    };

    fetchHistory();
  }, [analysisResult]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResumeText("");
    setUploadMessage(file ? `${file.name} selected` : "No file uploaded yet.");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("error");
      setUploadMessage("Please choose a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploadStatus("loading");
      setUploadMessage("Uploading and extracting text...");

      const response = await fetch("http://127.0.0.1:8000/resume/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setResumeText(data.text);
      setUploadStatus("success");
      setUploadMessage("Resume text extracted successfully.");
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || "Something went wrong.");
    }
  };

  const handleAnalysisPreview = async () => {
    if (!resumeText.trim()) {
      setAnalysisMessage("Please extract resume text first.");
      return;
    }

    if (!jobDescription.trim()) {
      setAnalysisMessage("Please paste a job description.");
      return;
    }

    try {
      setAnalysisMessage("Sending resume and job description to backend...");

      const response = await fetch("http://127.0.0.1:8000/analysis/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis preview failed");
      }

      setAnalysisMessage(
        `Resume chars: ${data.resume_characters} | Job description chars: ${data.job_description_characters}`
      );
    } catch (error) {
      setAnalysisMessage(error.message || "Something went wrong.");
    }
  };

  const handleFullAnalysis = async () => {
    if (!resumeText.trim()) {
      setAnalysisMessage("Please extract resume text first.");
      return;
    }

    if (!jobDescription.trim()) {
      setAnalysisMessage("Please paste a job description.");
      return;
    }

    try {
      setAnalysisResult(null);
      setAnalysisMessage("Running Gemini analysis...");

      const response = await fetch("http://127.0.0.1:8000/analysis/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      setAnalysisResult(data);
      setAnalysisMessage("Gemini analysis completed.");
    } catch (error) {
      setAnalysisMessage(error.message || "Something went wrong.");
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-top">
          <div>
            <p className="eyebrow">AI Resume Analyzer</p>
            <h1>Analyze resumes against job descriptions with AI.</h1>
            <p className="description">
              Upload a resume, paste a job description, and get structured
              feedback built for recruiter-facing demos.
            </p>
          </div>

          <aside className="hero-panel">
            <span className="label">Project Goal</span>
            <strong>Resume + JD Matching</strong>
            <p>
              FastAPI handles extraction and analysis. React shows the result in
              a clean dashboard.
            </p>
          </aside>
        </div>

        <div className="status-grid">
          <article className="status-card">
            <span className="label">Frontend</span>
            <strong>Running</strong>
            <p>React is set up and working.</p>
          </article>

          <article className="status-card">
            <span className="label">Backend</span>
            <strong>{apiStatus === "success" ? "Connected" : "Checking"}</strong>
            <p>{apiMessage}</p>
          </article>

          <article className="status-card">
            <span className="label">Goal</span>
            <strong>Recruiter Ready</strong>
            <p>We are building a real project, not a demo page.</p>
          </article>
        </div>

        <section className="upload-section">
          <h2>Resume Upload</h2>
          <p className="description">
            Choose a PDF resume and send it to the backend for text extraction.
          </p>

          <div className="upload-box">
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button type="button" onClick={handleUpload}>
              Extract Resume Text
            </button>
          </div>

          <p className={`upload-message ${uploadStatus}`}>{uploadMessage}</p>

          <textarea
            className="resume-preview"
            value={resumeText}
            placeholder="Extracted resume text will appear here..."
            readOnly
          />
        </section>

        <section className="upload-section">
          <h2>Job Description</h2>
          <p className="description">
            Paste the target job description. Next we will send both inputs for
            AI analysis.
          </p>

          <textarea
            className="resume-preview"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste job description here..."
          />

          <div className="upload-box">
            <button type="button" onClick={handleAnalysisPreview}>
              Send Analysis Preview
            </button>
            <button type="button" onClick={handleFullAnalysis}>
              Run Full AI Analysis
            </button>
          </div>

          <p className="upload-message">{analysisMessage}</p>

          {analysisResult ? (
            <section className="results-section">
              <div className="results-header">
                <h2>Analysis Results</h2>
                <p className="description">
                  These insights are generated from your current resume and the
                  target job description.
                </p>
              </div>

              <div className="results-grid">
                <article className="status-card score-card">
                  <span className="label">Match Score</span>
                  <strong className="score-value">
                    {analysisResult.match_percentage}%
                  </strong>
                  <p>Estimated resume-job fit.</p>
                </article>

                <article className="status-card">
                  <span className="label">Missing Skills</span>
                  <strong>
                    {analysisResult.missing_skills.length || 0} items
                  </strong>
                  <ul className="results-list">
                    {analysisResult.missing_skills.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="status-card result-wide">
                  <span className="label">Tailored Summary</span>
                  <strong>Suggested Resume Summary</strong>
                  <p>{analysisResult.tailored_summary}</p>
                </article>

                <article className="status-card result-wide">
                  <span className="label">Suggestions</span>
                  <strong>Resume Improvements</strong>
                  <ul className="results-list">
                    {analysisResult.improvement_suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>
          ) : null}
        </section>

        <section className="upload-section">
          <h2>Recent Analysis History</h2>
          <p className="description">
            Saved results from SQLite will appear here.
          </p>

          <div className="results-grid">
            {history.map((item) => (
              <article className="status-card" key={item.id}>
                <span className="label">Analysis #{item.id}</span>
                <strong>{item.match_percentage}% match</strong>
                <p>{item.tailored_summary}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
