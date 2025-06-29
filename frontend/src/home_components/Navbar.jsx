// Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="header inria-serif-regular">
      <div className="logo">
        <img src='/images/logo.png' height="30px" width="30px" alt="logo" />
        <h1>HisaabKitab</h1>
      </div>
      <nav className="nav">
        {/* <Link to="#services">Our Services</Link>
        <Link to="#about">About us</Link>
        <Link to="#contact">Contact Us</Link> */}
        <Link to="/signin" className="sign-in">Sign in</Link>
      </nav>
    </header>
  );
}

export default Navbar;

