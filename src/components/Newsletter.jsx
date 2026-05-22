import React, { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FormField from './FormField';
import { validateEmail } from '../utils/validators';
import '../styles/newsletter.css';

export default function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const result = validateEmail(email);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await onSubscribe(result.value);
      setEmail('');
      setTouched(false);
    } catch (err) {
      toast.error('Could not subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="newsletter-section">
      <div className="container newsletter-inner">
        <div className="newsletter-text">
          <h2>Stay Updated on New Arrivals</h2>
          <p>Get alerts on price drops, new flagships, and exclusive Elyoo deals.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            name="newsletter_email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched) setError(undefined);
            }}
            onBlur={() => {
              setTouched(true);
              const r = validateEmail(email);
              setError(r.valid ? undefined : r.error);
            }}
            error={touched ? error : undefined}
            placeholder="your@email.com"
            autoComplete="email"
            icon={FiMail}
            className="newsletter-field"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
