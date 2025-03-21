import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <h1>URL Shortener</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/list">My URLs</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;