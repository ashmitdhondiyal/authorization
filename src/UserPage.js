import React, { useEffect, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setUser(data))
      .catch(() => {
        setError('Not authorized');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/login');
  };

  if (!user) return <div className="user-info">Loading...</div>;

  return (
    <div className="user-info">
      <h2>User Info</h2>
      <div className="form-group">
        <label>Name</label>
        <div style={{
          background: '#f6f6f6',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '8px',
          fontSize: '1.05rem',
          border: '1px solid #eee'
        }}>{user.name}</div>
      </div>
      <div className="form-group">
        <label>Email</label>
        <div style={{
          background: '#f6f6f6',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '1.05rem',
          border: '1px solid #eee'
        }}>{user.email}</div>
      </div>
      <button onClick={handleLogout}>Logout</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
