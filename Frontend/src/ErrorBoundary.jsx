import { Component } from "react";

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#0a0e14",
    color: "#e6edf3",
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: 520,
    width: "100%",
    background: "#11161d",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: "32px 28px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
  },
  badge: {
    display: "inline-block",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: 999,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  body: {
    color: "#9ca3af",
    lineHeight: 1.5,
    margin: "0 0 24px",
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "#06d6d6",
    color: "#0a0e14",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#e6edf3",
    border: "1px solid #374151",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  details: {
    marginTop: 20,
    fontSize: 12,
    color: "#6b7280",
  },
  summary: {
    cursor: "pointer",
    userSelect: "none",
    padding: "8px 0",
  },
  pre: {
    background: "#020617",
    color: "#94a3b8",
    padding: 12,
    borderRadius: 6,
    overflow: "auto",
    maxHeight: 240,
    fontSize: 11,
    margin: "8px 0 0",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};

class ErrorBoundary extends Component {
  state = { error: null, info: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[UI crash]", error, info);
    this.setState({ info });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { error, info } = this.state;

    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <span style={styles.badge}>Unexpected error</span>
          <h1 style={styles.title}>Something went wrong.</h1>
          <p style={styles.body}>
            The screen crashed before it could finish loading. Your data is
            safe — try reloading the page. If this keeps happening, take a
            screenshot of the details below and send it to your developer.
          </p>

          <div style={styles.buttonRow}>
            <button style={styles.primaryBtn} onClick={this.handleReload}>
              Reload page
            </button>
            <button style={styles.secondaryBtn} onClick={this.handleReset}>
              Try again
            </button>
          </div>

          <details style={styles.details}>
            <summary style={styles.summary}>Technical details</summary>
            <pre style={styles.pre}>
              {error?.toString()}
              {info?.componentStack ? `\n${info.componentStack}` : ""}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
