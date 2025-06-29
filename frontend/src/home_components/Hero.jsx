// Hero.jsx
import React from 'react';

function Hero() {
  return (
    <main className="main">
      <div className="phone-image">
        <div className="phone-screen">
          <div className="app-illustration">
            <img src='/images/phone.png' alt="Financial App Illustration" />
          </div>
        </div>
      </div>
      <div className="content">
        <h1>Your financial Sidekick: Simple tips for Big Wins.</h1>
        <p>Smart financial Assistance for everyday life</p>
      </div>
    </main>
  );
}

export default Hero;
