import React, { useState, useRef } from "react";
import axios from "axios";
import validator from "validator";
import ReCAPTCHA from "react-google-recaptcha";

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");

    if (!validator.isURL(longUrl)) {
      setError("Please enter a valid URL.");
      return;
    }

    const token = await recaptchaRef.current.executeAsync();
    if (!token) {
      setError("Please verify the CAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/shorten`,
        {
          longUrl,
          token,
        }
      );
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current.reset();
    }
  };

  const confirmAndRedirect = (url) => {
    if (window.confirm("You're about to leave this site. Continue?")) {
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🔗 URL Shortener</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="url"
          placeholder="Enter a long URL..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Shorten
        </button>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          size="invisible"
        />
      </form>
      {loading && <p style={styles.loading}>⏳ Processing...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {shortUrl && (
        <p style={styles.result}>
          Short URL:&nbsp;
          <button
            onClick={() => confirmAndRedirect(shortUrl)}
            style={styles.linkButton}
          >
            {shortUrl}
          </button>
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #232526, #414345)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#fff",
    padding: "2rem",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "2rem",
    color: "#00d4ff",
    fontWeight: "bold",
    textShadow: "1px 1px 2px black",
  },
  form: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "center",
  },
  input: {
    width: "320px",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    outline: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  button: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    backgroundColor: "#00d4ff",
    color: "#000",
    border: "none",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0, 212, 255, 0.3)",
  },
  loading: {
    marginTop: "1rem",
    color: "#ffc107",
  },
  error: {
    marginTop: "1rem",
    color: "#ff4d4f",
  },
  result: {
    marginTop: "1.5rem",
    fontSize: "1.1rem",
    color: "#00ffab",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#00ffab",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
};

export default App;

