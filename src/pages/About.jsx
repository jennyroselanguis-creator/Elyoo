import React from 'react';
import '../styles/about.css';

export default function About() {
  const developers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Full Stack Developer',
      initials: 'JD',
      bio: 'Experienced React and Node.js developer with 5+ years in web development. Specializes in building scalable e-commerce platforms.',
      skills: ['React', 'Node.js', 'MySQL', 'UI/UX Design'],
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Frontend Developer & Designer',
      initials: 'JS',
      bio: 'Creative frontend developer passionate about building beautiful, responsive interfaces. Expert in modern CSS and React patterns.',
      skills: ['React', 'CSS', 'JavaScript', 'UI Design'],
    },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About Elyoo Mobile Devices</h1>
          <p>Leading the revolution in authentic premium mobile devices</p>
        </div>
      </section>

      {/* Company Info */}
      <section className="about-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            At Elyoo Mobile Devices, we're committed to providing customers with authentic, 
            premium smartphones from trusted brands worldwide. Our mission is to make high-quality 
            mobile technology accessible to everyone with transparent pricing and exceptional service.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon" aria-hidden>A</div>
              <h3>Authenticity</h3>
              <p>100% genuine products from authorized distributors</p>
            </div>
            <div className="value-card">
              <div className="value-icon" aria-hidden>Q</div>
              <h3>Quality</h3>
              <p>Premium devices that deliver exceptional performance</p>
            </div>
            <div className="value-card">
              <div className="value-icon" aria-hidden>T</div>
              <h3>Trust</h3>
              <p>Transparent pricing and customer-focused service</p>
            </div>
            <div className="value-card">
              <div className="value-icon" aria-hidden>I</div>
              <h3>Innovation</h3>
              <p>Latest technology and continuous improvement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="developers-section">
        <div className="container">
          <h2>Meet the Elyoo Team</h2>
          <p className="section-intro">
            The people behind Elyoo Mobile — dedicated to curating authentic devices and
            a smooth shopping experience for every customer.
          </p>

          <div className="developers-grid">
            {developers.map((dev) => (
              <article key={dev.id} className="developer-card">
                <div className="dev-avatar" aria-hidden="true">
                  {dev.initials}
                </div>
                <h3>{dev.name}</h3>
                <p className="dev-role">{dev.role}</p>
                <p className="dev-bio">{dev.bio}</p>
                <ul className="dev-skills" aria-label={`${dev.name} skills`}>
                  {dev.skills.map((skill) => (
                    <li key={skill}>
                      <span className="skill-badge">{skill}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Product Listings</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Brand Partners</p>
            </div>
            <div className="stat-card">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
