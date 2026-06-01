import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';
import { authAPI } from '../api/client';
import { useStore } from '../store/store';
import { isAdminRole, isStaffRole } from '../utils/roles';
import FormField from '../components/FormField';
import { validatePassword } from '../utils/validators';
import { validateTeamUsername } from '../config/teamAccounts';
import { setAuthToken } from '../utils/security';
import '../styles/login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { setUser, isStaff, isAdmin } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isStaff) {
      navigate(isAdmin ? '/admin' : '/admin/orders', { replace: true });
    }
  }, [isStaff, isAdmin, navigate]);

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === 'username') {
      const r = validateTeamUsername(username);
      setErrors((e) => ({ ...e, username: r.valid ? undefined : r.error }));
    }
    if (field === 'password') {
      const r = validatePassword(password, { minLength: 2 });
      setErrors((e) => ({ ...e, password: r.valid ? undefined : r.error }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    const userR = validateTeamUsername(username);
    const pwdR = validatePassword(password, { minLength: 2 });
    setErrors({
      username: userR.valid ? undefined : userR.error,
      password: pwdR.valid ? undefined : pwdR.error,
    });

    if (!userR.valid || !pwdR.valid) {
      toast.error('Please correct the errors above.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(userR.value, pwdR.value);
      const { token, user } = response.data;
      setAuthToken(token);
      setUser(user);
      toast.success('Welcome back!');
      navigate(
        isStaffRole(user.role) ? (isAdminRole(user.role) ? '/admin' : '/admin/orders') : '/'
      );
    } catch (error) {
      toast.error('Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-intro">
          <p className="auth-eyebrow">Elyoo Mobile</p>
          <h1>Team sign in</h1>
          <p>
            One login for administrators and staff. Your role decides what you can access after
            sign-in.
          </p>
          <ul className="auth-benefits">
            <li>Administrators — products, brands, orders, and team</li>
            <li>Staff — process and update customer orders</li>
            <li>Secure encrypted sign-in</li>
          </ul>
        </div>

        <div className="form-card auth-card">
          <div className="form-card-header auth-card-header">
            <h2>Store portal</h2>
            <p>Sign in with your assigned username and password.</p>
          </div>

          <form onSubmit={handleLogin} noValidate className="auth-form">
            <FormField
              label="Username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => handleBlur('username')}
              error={touched.username ? errors.username : undefined}
              required
              maxLength={32}
              placeholder="Enter your username"
              autoComplete="username"
              icon={FiUser}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? errors.password : undefined}
              hint="Your assigned store password"
              required
              maxLength={128}
              placeholder="Enter your password"
              autoComplete="current-password"
              icon={FiLock}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="auth-footer-note">
            <FiShield aria-hidden="true" /> Your connection is encrypted. Authorized store
            accounts only.
          </p>

          <p className="auth-back-link">
            <Link to="/">← Back to storefront</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
