// src/components/Login.js
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css';




function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      setError('Google Sign-in error: ' + error.message);
    }
  };


  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Email Sign-in error: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Registration error: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔐 {isRegistering ? 'Create an Account' : 'Sign in to Doc2Voice'}</h1>
        <p>Access our powerful document-to-voice converter</p>
        <form onSubmit={isRegistering ? handleRegister : handleEmailSignIn} style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <button type="submit" className="email-btn" style={{ width: '100%', marginBottom: '0.5rem' }}>
            {isRegistering ? 'Create Account' : 'Sign in with Email'}
          </button>
        </form>
        <button className="google-btn" onClick={handleGoogleSignIn} style={{ width: '100%' }}>
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
          Sign in with Google
        </button>
        <button
          type="button"
          className="toggle-btn"
          style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', color: '#4f46e5', border: 'none', cursor: 'pointer' }}
          onClick={() => { setIsRegistering(r => !r); setError(''); }}
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;
