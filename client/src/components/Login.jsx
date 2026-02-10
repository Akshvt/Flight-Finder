import React, { useContext, useState, useEffect } from 'react';
import { GeneralContext } from '../context/GeneralContext';
import './Login.css';

const Login = ({ setIsLogin }) => {
  const { setEmail, setPassword, login } = useContext(GeneralContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100); // Trigger slide-in animation
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(); // login handles setting context, role checks etc.
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`auth-form ${animate ? 'slide-in' : ''}`} onSubmit={handleLogin} noValidate>
      <h2 className="auth-title">Welcome Back 👋</h2>

      <div className="form-floating mb-3 auth-input">
        <input
          type="email"
          className="form-control"
          id="floatingInput"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingInput">Email Address</label>
      </div>

      <div className="form-floating mb-3 auth-input">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
        {loading ? <span className="spinner"></span> : 'Sign In'}
      </button>

      <p className="auth-switch-text">
        New here?{' '}
        <span className="auth-switch-link" onClick={() => setIsLogin(false)}>
          Create an account
        </span>
      </p>
    </form>
  );
};

export default Login;
