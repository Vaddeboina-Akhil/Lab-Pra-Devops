import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [buildInfo, setBuildInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuildInfo = async () => {
      try {
        const res = await fetch("/build-info.json", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to load build info");
        }
        const data = await res.json();
        setBuildInfo(data);
        // #region agent log
        fetch(
          "http://127.0.0.1:7394/ingest/722304ba-72db-4375-9a3c-0f8c249f8c2c",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "f65546",
            },
            body: JSON.stringify({
              sessionId: "f65546",
              runId: "initial",
              hypothesisId: "H1",
              location: "App.jsx:16",
              message: "build-info fetch success",
              data: { buildInfo: data },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion
      } catch (err) {
        // #region agent log
        fetch(
          "http://127.0.0.1:7394/ingest/722304ba-72db-4375-9a3c-0f8c249f8c2c",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "f65546",
            },
            body: JSON.stringify({
              sessionId: "f65546",
              runId: "initial",
              hypothesisId: "H2",
              location: "App.jsx:18",
              message: "build-info fetch failed",
              data: { error: String(err) },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
        // #endregion
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBuildInfo();
  }, []);

  const formattedDeployTime =
    buildInfo && buildInfo.deployTime
      ? new Date(buildInfo.deployTime).toLocaleString()
      : "N/A";

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">DevOps Portfolio</div>
        <nav>
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="hero-content">
            <p className="tagline">Hello, I'm</p>
            <h1>Your Name</h1>
            <h2>DevOps Enthusiast &amp; Cloud Learner</h2>
            <p className="hero-subtitle">
              I love automating builds, deployments, and monitoring using
              Jenkins, Docker, and Kubernetes.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn primary">
                View Projects
              </a>
              <a href="#contact" className="btn secondary">
                Contact Me
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <h3>About</h3>
          <p>
            This portfolio is fully automated using a CI/CD pipeline. Whenever I
            push code to GitHub, Jenkins builds a new Docker image and deploys
            it to a Kubernetes cluster using Rolling Updates.
          </p>
        </section>

        <section id="skills" className="section">
          <h3>Skills</h3>
          <div className="grid">
            <div className="card">
              <h4>DevOps &amp; Cloud</h4>
              <p>Jenkins, Docker, Kubernetes, Helm, GitHub Actions</p>
            </div>
            <div className="card">
              <h4>Backend</h4>
              <p>Node.js, Express, REST APIs</p>
            </div>
            <div className="card">
              <h4>Frontend</h4>
              <p>React, HTML, CSS, JavaScript</p>
            </div>
            <div className="card">
              <h4>Tools</h4>
              <p>Linux, Git, Bash, Docker Hub, Minikube</p>
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <h3>Projects</h3>
          <div className="grid">
            <div className="card">
              <h4>CI/CD Portfolio</h4>
              <p>
                This project – a fully automated portfolio deployed on
                Kubernetes using Jenkins and Docker.
              </p>
            </div>
            <div className="card">
              <h4>Sample Microservice</h4>
              <p>
                Containerized Node.js API with Kubernetes deployment and
                monitoring.
              </p>
            </div>
            <div className="card">
              <h4>Monitoring Dashboard</h4>
              <p>
                Basic monitoring setup using Prometheus &amp; Grafana for
                container workloads.
              </p>
            </div>
          </div>
        </section>

        <section id="cicd" className="section ci-panel">
          <h3>CI/CD Deployment Info</h3>
          {loading && <p className="status">Loading build information…</p>}
          {error && !loading && (
            <p className="status error">
              Failed to load build info. Showing default values.
            </p>
          )}
          <div className="ci-grid">
            <div className="ci-item">
              <span className="label">App Version</span>
              <span className="value">
                {buildInfo?.appVersion ?? "v1.0.0"}
              </span>
            </div>
            <div className="ci-item">
              <span className="label">Build Number</span>
              <span className="value">
                {buildInfo?.buildNumber ? `#${buildInfo.buildNumber}` : "#0"}
              </span>
            </div>
            <div className="ci-item">
              <span className="label">Last Deployed</span>
              <span className="value">{formattedDeployTime}</span>
            </div>
            <div className="ci-item">
              <span className="label">Environment</span>
              <span className="value">
                {buildInfo?.environment ?? "Kubernetes"}
              </span>
            </div>
          </div>
          <p className="note">
            These values are injected as environment variables during the Jenkins
            pipeline and baked into the Docker image.
          </p>
        </section>

        <section id="contact" className="section">
          <h3>Contact</h3>
          <p>
            Email:{" "}
            <a href="mailto:you@example.com">you@example.com</a>
            <br />
            GitHub: <a href="https://github.com/yourusername">yourusername</a>
            <br />
            LinkedIn:{" "}
            <a href="https://linkedin.com/in/yourprofile">yourprofile</a>
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Your Name</span>
        <span>Built with React · Deployed on Kubernetes</span>
      </footer>
    </div>
  );
}

export default App;

