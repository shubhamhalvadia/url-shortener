import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/');
    };
  
    return (
      <nav className="navbar">
        <div className="container">
          <h1>URL Shortener</h1>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/list">My URLs</Link>
            {token ? (
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;