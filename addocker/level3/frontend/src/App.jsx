
import { useState } from "react";
import "./index.css";

const actions = [
  {
    name: "Load Balancer",
    path: "/gateway",
    description: "See which gateway handles each request",
    icon: "⇄",
  },
  {
    name: "Auth Service",
    path: "/auth",
    description: "Route a request to authentication",
    icon: "◈",
  },
  {
    name: "Product Service",
    path: "/product",
    description: "Fetch products from the product service",
    icon: "▦",
  },
  {
    name: "Order Service",
    path: "/order",
    description: "Fetch orders from the order service",
    icon: "▤",
  },
];

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function sendRequest(action) {
    setLoading(action.path);
    setError("");

    const start = performance.now();

    try {
      // Every request goes through Nginx first.
      const response = await fetch(
        `${action.path}?_=${Date.now()}`,
        { cache: "no-store" }
      );

      const data = await response.json();
      const duration = Math.round(performance.now() - start);

      const result = {
        id: crypto.randomUUID(),
        name: action.name,
        path: action.path,
        status: response.status,
        duration,
        data,
        time: new Date().toLocaleTimeString(),
      };

      setResults((previous) => [result, ...previous].slice(0, 20));

      if (!response.ok) {
        setError(`${action.name} returned HTTP ${response.status}`);
      }
    } catch (err) {
      setError(
        `Request failed: ${err.message}. Check Docker containers and logs.`
      );
    } finally {
      setLoading("");
    }
  }

  async function testLoadBalancer() {
    for (let i = 0; i < 6; i++) {
      await sendRequest(actions[0]);
    }
  }

  async function testAllServices() {
    for (const action of actions.slice(1)) {
      await sendRequest(action);
    }
  }

  const gatewayCounts = results.reduce((counts, result) => {
    const gateway = result.data?.gateway;

    if (gateway) {
      counts[gateway] = (counts[gateway] || 0) + 1;
    }

    return counts;
  }, {});

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">N</span>
          <span>TrafficLab</span>
        </a>

        <span className="status">
          <span className="status-dot" />
          Docker environment
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">SYSTEM DESIGN · LEVEL 3</p>

        <h1>
          Understand your
          <br />
          <span>request flow.</span>
        </h1>

        <p className="hero-description">
          Observe how Nginx distributes traffic between gateway
          instances and how the API gateway routes requests
          to individual microservices.
        </p>

        <div className="hero-actions">
          <button
            className="button primary"
            disabled={Boolean(loading)}
            onClick={testLoadBalancer}
          >
            {loading ? "Sending request..." : "Test load balancer ↗"}
          </button>

          <button
            className="button secondary"
            disabled={Boolean(loading)}
            onClick={testAllServices}
          >
            Test all services
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ARCHITECTURE</p>
            <h2>Request pipeline</h2>
          </div>
          <span className="tag">4 layers</span>
        </div>

        <div className="pipeline">
          {[
            ["01", "Browser", "localhost:8080"],
            ["02", "Nginx", "Load balancer"],
            ["03", "API Gateway", "gateway1 / gateway2"],
            ["04", "Microservices", "auth / product / order"],
          ].map(([number, title, description]) => (
            <div className="pipeline-step" key={number}>
              <span className="step-number">{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              {number !== "04" && (
                <span className="step-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">API PLAYGROUND</p>
            <h2>Send a request</h2>
          </div>
          <span className="tag">Live responses</span>
        </div>

        <div className="service-grid">
          {actions.map((action) => (
            <article className="service-card" key={action.path}>
              <div className="service-icon">{action.icon}</div>

              <h3>{action.name}</h3>
              <p>{action.description}</p>

              <code>GET {action.path}</code>

              <button
                className="button card-button"
                disabled={Boolean(loading)}
                onClick={() => sendRequest(action)}
              >
                {loading === action.path ? "Requesting..." : "Send request →"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OBSERVABILITY</p>
            <h2>Gateway distribution</h2>
          </div>

          <span className="tag">{results.length} responses</span>
        </div>

        <div className="distribution">
          {Object.entries(gatewayCounts).map(([gateway, count]) => (
            <div className="distribution-item" key={gateway}>
              <div className="distribution-label">
                <span>{gateway}</span>
                <strong>{count} requests</strong>
              </div>

              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${
                      (count / Math.max(results.length, 1)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}

          {Object.keys(gatewayCounts).length === 0 && (
            <p className="empty-state">
              Send a request to see which gateway handles it.
            </p>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="section-heading history-heading">
          <h2>Request history</h2>

          <button
            className="text-button"
            onClick={() => setResults([])}
          >
            Clear history
          </button>
        </div>

        <div className="history">
          {results.map((result) => (
            <article className="history-item" key={result.id}>
              <div className="history-top">
                <strong>{result.name}</strong>
                <span className="response-time">
                  {result.duration} ms
                </span>
              </div>

              <div className="history-meta">
                <code>GET {result.path}</code>
                <span className="http-status">
                  HTTP {result.status}
                </span>
                <span>{result.time}</span>
              </div>

              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </article>
          ))}

          {results.length === 0 && (
            <p className="empty-state">
              No requests yet. Click “Test load balancer” to begin.
            </p>
          )}
        </div>
      </section>

      <footer>
        TrafficLab · Docker Compose · Nginx · Node.js
      </footer>
    </main>
  );
}
