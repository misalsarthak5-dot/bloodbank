import { useState } from 'react';
import './LoginPage.css';
import loginIllustration from '../assets/login_illustration.png';

// SVG Icons
const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const BloodDrop = () => (
  <svg className="floating-icon icon-drop" width="32" height="32" viewBox="0 0 24 24" fill="#e53935" stroke="none">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

const Heart = () => (
  <svg className="floating-icon icon-heart" width="28" height="28" viewBox="0 0 24 24" fill="#e53935" stroke="none">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const PlusSign = () => (
  <svg className="floating-icon icon-plus" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === 'admin@blood.com' && password === '1234') {
      onLogin({ email, role: 'Admin' });
    } else if (email === 'user@blood.com' && password === '1234') {
      onLogin({ email, role: 'User' });
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-visuals">
        <BloodDrop />
        <Heart />
        <PlusSign />
        
        <div className="illustration-wrapper">
          <img src={loginIllustration} alt="Healthcare Illustration" className="illustration" />
        </div>
        
        <div className="visuals-text">
          <h2>Blood Finder</h2>
          <p>Connecting life-saving resources with those in need. Join our community to monitor inventory and ensure regional availability.</p>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-card glass-card slide-in-right">
          <h2 className="text-center" style={{ marginBottom: '0.5rem', color: 'var(--text-dark)', fontWeight: '700' }}>Welcome Back</h2>
          <p className="text-center" style={{ color: 'var(--text-light)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
            Please log in to your account
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon"><EmailIcon /></span>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g., user@blood.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <span className="input-icon"><LockIcon /></span>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" style={{ width: '100%', marginTop: '2.5rem', padding: '0.9rem', fontSize: '1rem' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
