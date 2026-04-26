import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useId, useRef, useState } from "react";
import offerlyLogo from "../assets/offerly-logo.svg";

const COMPACT_SIZE = { width: 92, height: 92 };
const EXPANDED_SIZE = { width: 560, height: 720 };
const WINDOW_ANIMATION_MS = 240;
const PANEL_OPEN_MS = 220;
const PANEL_CLOSE_LEAD_MS = 100;

type LauncherStage = "closed" | "opening" | "open" | "closing";

function isTauriDesktop() {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in window &&
    window.__TAURI_INTERNALS__ !== undefined
  );
}
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
  const desktopShell = isTauriDesktop();
  const resumeInputId = useId();
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const windowSizeRef = useRef(desktopShell ? COMPACT_SIZE : EXPANDED_SIZE);
  const collapsedPressRef = useRef<{ x: number; y: number } | null>(null);
  const collapsedDragRef = useRef(false);

  const [isExpanded, setIsExpanded] = useState(!desktopShell);
  const [launcherStage, setLauncherStage] = useState<LauncherStage>(
    desktopShell ? "closed" : "open",
  );
  const [dragActive, setDragActive] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const isReady = resumeFile !== null && jobDescription.trim().length > 0;

  useEffect(() => {
    if (!desktopShell) {
      return;
    }

    document.body.classList.add("body--tauri-launcher");
    document.documentElement.classList.add("html--tauri-launcher");
    let cancelled = false;

    const syncWindow = async () => {
      const appWindow = getCurrentWindow();
      const appWebview = getCurrentWebview();
      const nextSize = isExpanded ? EXPANDED_SIZE : COMPACT_SIZE;
      const startSize = windowSizeRef.current;
      const logicalSize = new LogicalSize(nextSize.width, nextSize.height);

      const easeInOutCubic = (value: number) => {
        if (value < 0.5) {
          return 4 * value * value * value;
        }

        return 1 - Math.pow(-2 * value + 2, 3) / 2;
      };

      try {
        const backgroundColor: [number, number, number, number] = isExpanded
          ? [255, 250, 252, 255]
          : [0, 0, 0, 0];

        await appWindow.setDecorations(false);
        await appWindow.setResizable(false);
        await appWindow.setAlwaysOnTop(true);
        await appWindow.setShadow(false);
        await appWindow.setBackgroundColor(backgroundColor);
        await appWebview.setBackgroundColor(backgroundColor);

        await appWindow.setMinSize(null);
        await appWindow.setMaxSize(null);

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        const startedAt = performance.now();

        const animate = (now: number) => {
          if (cancelled) {
            return;
          }

          const progress = Math.min(
            (now - startedAt) / WINDOW_ANIMATION_MS,
            1,
          );
          const easedProgress = easeInOutCubic(progress);
          const width = Math.round(
            startSize.width +
              (nextSize.width - startSize.width) * easedProgress,
          );
          const height = Math.round(
            startSize.height +
              (nextSize.height - startSize.height) * easedProgress,
          );

          windowSizeRef.current = { width, height };
          void appWindow.setSize(new LogicalSize(width, height));

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
          }

          animationFrameRef.current = null;
          windowSizeRef.current = nextSize;
          void appWindow.setSize(logicalSize);
          void appWindow.setMinSize(logicalSize);
          void appWindow.setMaxSize(logicalSize);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error("Unable to sync launcher window", error);
      }
    };

    void syncWindow();

    return () => {
      cancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      document.documentElement.classList.remove("html--tauri-launcher");
      document.body.classList.remove("body--tauri-launcher");
    };
  }, [desktopShell, isExpanded]);

  const updateFile = (files: FileList | null) => {
    const nextFile = files?.[0] ?? null;
    setResumeFile(nextFile);
  };

  const clearLauncherTimers = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearLauncherTimers();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const openLauncher = () => {
    if (!desktopShell || launcherStage === "opening" || launcherStage === "open") {
      return;
    }

    clearLauncherTimers();
    setLauncherStage("opening");
    setIsExpanded(true);

    openTimerRef.current = window.setTimeout(() => {
      setLauncherStage("open");
      openTimerRef.current = null;
    }, PANEL_OPEN_MS);
  };

  const closeLauncher = () => {
    if (
      !desktopShell ||
      launcherStage === "closing" ||
      launcherStage === "closed"
    ) {
      return;
    }

    clearLauncherTimers();
    setLauncherStage("closing");

    closeTimerRef.current = window.setTimeout(() => {
      setIsExpanded(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_LEAD_MS);

    openTimerRef.current = window.setTimeout(() => {
      setLauncherStage("closed");
      openTimerRef.current = null;
    }, PANEL_CLOSE_LEAD_MS + PANEL_OPEN_MS);
  };

  const handleWindowDragStart = (event: React.MouseEvent<HTMLElement>) => {
    if (!desktopShell || event.button !== 0) {
      return;
    }

    void getCurrentWindow().startDragging();
  };

  const handleHeaderMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    handleWindowDragStart(event);
  };

  const handleCollapsedMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    if (!desktopShell || isExpanded || event.button !== 0) {
      return;
    }

    collapsedPressRef.current = { x: event.clientX, y: event.clientY };
    collapsedDragRef.current = false;
  };

  const handleCollapsedMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!desktopShell || isExpanded || collapsedPressRef.current === null) {
      return;
    }

    const distanceX = event.clientX - collapsedPressRef.current.x;
    const distanceY = event.clientY - collapsedPressRef.current.y;
    const movedEnough = Math.hypot(distanceX, distanceY) > 6;

    if (!collapsedDragRef.current && movedEnough) {
      collapsedDragRef.current = true;
      void getCurrentWindow().startDragging();
    }
  };

  const handleCollapsedMouseUp = () => {
    if (!desktopShell || isExpanded) {
      return;
    }

    const shouldOpen =
      collapsedPressRef.current !== null && collapsedDragRef.current === false;

    collapsedPressRef.current = null;
    collapsedDragRef.current = false;

    if (shouldOpen) {
      openLauncher();
    }
  };

  const resetCollapsedPointerState = () => {
    collapsedPressRef.current = null;
    collapsedDragRef.current = false;
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

  const intakeContent = (
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

  if (!desktopShell) {
    return intakeContent;
  }

  return (
    <section
      className={`launcher-shell launcher-shell--desktop launcher-shell--${launcherStage}`}
    >
      <div className="launcher-bubble-frame">
        <button
          className="launcher-bubble"
          type="button"
          onMouseDown={handleCollapsedMouseDown}
          onMouseMove={handleCollapsedMouseMove}
          onMouseUp={handleCollapsedMouseUp}
          onMouseLeave={resetCollapsedPointerState}
          onDragStart={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openLauncher();
            }
          }}
          aria-label="Open Offerly"
        >
          <img
            className="launcher-bubble__logo"
            src={offerlyLogo}
            alt="Offerly"
          />
        </button>
      </div>

      <article className="launcher-panel">
        <header
          className="launcher-panel__header"
          onMouseDown={handleHeaderMouseDown}
        >
          <div className="launcher-panel__title-group">
            <span className="launcher-panel__eyebrow">Offerly Copilot</span>
            <strong>Candidate Analyzer</strong>
          </div>

          <button
            className="launcher-panel__collapse"
            type="button"
            onClick={closeLauncher}
            aria-label="Collapse Offerly"
          >
            <img
              className="launcher-panel__collapse-logo"
              src={offerlyLogo}
              alt="Offerly"
            />
          </button>
        </header>

        <div className="launcher-panel__scroll">{intakeContent}</div>
      </article>
    </section>
  );
}
