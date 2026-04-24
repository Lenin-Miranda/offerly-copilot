import { useId, useState } from "react";

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileLabel(file: File | null, fallback: string) {
  if (!file) {
    return fallback;
  }

  return `${file.name} - ${formatFileSize(file.size)}`;
}

export default function DragnDrop() {
  const resumeInputId = useId();

  const [dragActive, setDragActive] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const isReady = resumeFile !== null && jobDescription.trim().length > 0;

  const updateFile = (files: FileList | null) => {
    const nextFile = files?.[0] ?? null;
    setResumeFile(nextFile);
  };

  const handleDrag = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
      return;
    }

    if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    updateFile(event.dataTransfer.files);
    event.dataTransfer.clearData();
  };

  return (
    <section className="upload-shell">
      <div className="hero-copy">
        <p className="eyebrow">Resume Match Workspace</p>
        <h1>Upload your CV and paste the job post.</h1>
        <p className="hero-copy__body">
          A quiet intake screen for the first step: add your resume, paste the
          role description, and get ready for the AI analysis next.
        </p>
      </div>

      <article className="upload-card upload-card--single">
        <div className="upload-card__header">
          <span className="upload-card__tag">Required</span>
          <h2>Resume / CV</h2>
          <p>Drop a PDF or Word file with your latest resume.</p>
        </div>

        <input
          id={resumeInputId}
          className="sr-only"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(event) => updateFile(event.target.files)}
        />

        <label
          className={`dropzone ${dragActive ? "dropzone--active" : ""}`}
          htmlFor={resumeInputId}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <span className="dropzone__badge">CV</span>
          <p className="dropzone__title">Drop your resume here</p>
          <p className="dropzone__copy">
            or click to choose a file from your computer
          </p>
          <span className="dropzone__button">Choose resume</span>
        </label>

        <div className="file-chip-row">
          <div className="file-chip">
            <span className="file-chip__label">Selected file</span>
            <strong>
              {getFileLabel(resumeFile, "No resume selected yet")}
            </strong>
          </div>
          {resumeFile && (
            <button
              className="secondary-button"
              type="button"
              onClick={() => setResumeFile(null)}
            >
              Clear
            </button>
          )}
        </div>
      </article>

      <article className="details-card">
        <div className="details-card__header">
          <div>
            <p className="eyebrow eyebrow--compact">Paste Job Description</p>
            <h2>Tell the AI what role you are targeting</h2>
          </div>
          <span
            className={`status-pill ${isReady ? "status-pill--ready" : ""}`}
          >
            {isReady
              ? "Ready for AI analysis"
              : "Waiting for resume + description"}
          </span>
        </div>

        <textarea
          className="job-textarea"
          placeholder="Paste the full job description here. Include responsibilities, required skills, and any must-have qualifications."
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          rows={10}
        />

        <div className="details-card__footer">
          <p>
            Next step: send the resume file plus this job description to your
            API so the AI can score fit and suggest resume improvements.
          </p>
          <button className="primary-button" type="button" disabled={!isReady}>
            Analyze candidate fit
          </button>
        </div>
      </article>
    </section>
  );
}
