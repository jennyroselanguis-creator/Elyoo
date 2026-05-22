import React from 'react';
import '../styles/hero.css';

export default function Hero() {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">
          Authentic devices · Verified checkout · Nationwide delivery
        </div>
        <h2 className="hero-title">Premium Mobile, Curated for You</h2>
        <p className="hero-subtitle">
          Handpicked flagships and everyday essentials from the brands you trust —
          transparent pricing, secure orders, and attentive service.
        </p>
        <div className="hero-actions">
          <a href="#products" className="hero-cta">
            Shop All Devices
          </a>
          <a href="#newsletter" className="hero-cta-secondary">
            Get Deal Alerts
          </a>
        </div>
        <div className="hero-stats">
          <div>
            <strong>50+</strong>
            <span>Models</span>
          </div>
          <div>
            <strong>6</strong>
            <span>Top Brands</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Support</span>
          </div>
        </div>
      </div>
      <div className="hero-background">
        <div className="hero-gradient" />
        <div className="hero-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
      </div>
    </section>
  );
}
