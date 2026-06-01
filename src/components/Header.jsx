import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiSearch, FiPackage, FiLogIn } from 'react-icons/fi';
import { useStore } from '../store/store';
import '../styles/header.css';

function navLinkClassName({ isActive }, extra = '') {
  const base = 'nav-link';
  const active = isActive ? ' active' : '';
  return `${base}${active}${extra ? ` ${extra}` : ''}`;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart, searchQuery, setSearchQuery, supabaseConnected } = useStore();
  const { pathname } = useLocation();
  const onLogin = pathname === '/login';

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-mark" aria-hidden>E</span>
          <div className="logo-text">
            <h1>Elyoo</h1>
            <p className="tagline">Curated devices · Authentic only</p>
          </div>
        </Link>

        <div className="header-search">
          <FiSearch className="search-icon" />
          <input
            type="search"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') window.location.href = '/#products';
            }}
          />
        </div>

        <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClassName} onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/orders" className={navLinkClassName} onClick={closeMenu}>
            <FiPackage aria-hidden="true" /> My Orders
          </NavLink>
          <NavLink to="/about" className={navLinkClassName} onClick={closeMenu}>
            About
          </NavLink>
          <NavLink
            to="/cart"
            className={(state) => navLinkClassName(state, 'cart-link')}
            onClick={closeMenu}
          >
            <FiShoppingCart aria-hidden="true" />
            Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>

          <span className="nav-divider" aria-hidden="true" />

          <NavLink
            to="/login"
            className={(state) => navLinkClassName(state, 'nav-team-login')}
            onClick={closeMenu}
          >
            <FiLogIn aria-hidden="true" /> Team login
          </NavLink>
        </nav>

        {supabaseConnected && (
          <span className="connection-badge cloud" title="Connected to Supabase">
            Live
          </span>
        )}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
