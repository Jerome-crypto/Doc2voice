import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import TTSUploader from './components/TTSUploader';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './App.css';

function Home() {
  const navigate = useNavigate();

  const handleTryNow = () => {
    const user = auth.currentUser;
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <h1>📢 Doc2Audio</h1>
          <p>Transform your documents into lifelike audio with our advanced voice generation tool making information more accessible, engaging, and easy to consume anytime, anywhere.</p>
        </div>
      </header>

      <section className="use-cases">
        <div className="container">
          <h2>Perfect For</h2>
          <div className="cases">
            <div><h3> Students</h3><p>Convert notes and textbooks into audio for revision.</p></div>
            <div><h3> Professionals</h3><p>Listen to reports or articles on the go.</p></div>
            <div><h3> Visually Impaired</h3><p>Empowering accessibility through voice conversion.</p></div>
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="container">
          <h2>Turn Text into Audio with One Click</h2>
          <p>Upload any PDF, Word, or Text file and get a realistic generated voice reading it for you in seconds.</p>
          <button className="primary" onClick={handleTryNow}>🎤 Try it Now</button>
        </div>
      </section>

      <section className="demo">
        <div className="container">
          <h2>🎧 Hear a Sample</h2>
          <p>Click below to hear a sample of our realistic voice generation.</p>
          <audio controls src="/samples.mp3"></audio>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div><h3>1️⃣ Upload</h3><p>Select a document file</p></div>
            <div><h3>2️⃣ Convert</h3><p>Our AI reads and generates audio</p></div>
            <div><h3>3️⃣ Download</h3><p>Listen or save the result instantly</p></div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Doc2Voice. All rights reserved.</p>
          <p>Get in touch or follow:</p>
          <div className="socials">
            <a href="https://www.instagram.com/@jeromeniyikiza" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faInstagram} /> Instagram
            </a>
            <br /><br />
            <a href="https://www.tiktok.com/@jeromeniyikiza" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTiktok} /> TikTok
            </a>
            <br /><br />
            <a href="https://www.linkedin.com/in/jerome-niyikiza-9a68a9286/" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="container">
                <TTSUploader />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
