import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/store';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { newsletterAPI } from '../api/client';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';
import { MIN_PRODUCT_PRICE, MAX_CATALOG_PRICE } from '../data/seed';
import '../styles/home.css';

export default function Home() {
  const {
    products,
    brands,
    selectedBrand,
    setSelectedBrand,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
    refreshProducts,
  } = useStore();
  const [sortBy, setSortBy] = useState('featured');

  // Re-fetch products every time the home page mounts
  // so admin-added products appear immediately
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured).slice(0, 4),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedBrand) list = list.filter((p) => p.brand_id === selectedBrand);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q) ||
          p.brand_name?.toLowerCase().includes(q) ||
          (p.specs || p.description || '').toLowerCase().includes(q)
      );
    }
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    return list;
  }, [products, selectedBrand, searchQuery, priceRange]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'stock':
        return b.stock - a.stock;
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleNewsletter = async (email) => {
    try {
      await newsletterAPI.subscribe(email);
      toast.success('Subscribed successfully!');
    } catch {
      toast.error('Could not subscribe. Please try again.');
    }
  };

  return (
    <div className="home">
      <Hero />

      {featuredProducts.length > 0 && (
        <section className="container featured-section">
          <h2 className="section-title">Featured Devices</h2>
          <p className="section-subtitle">Hand-picked flagships and best sellers</p>
          <div className="grid grid-featured">
            {featuredProducts.map((product) => (
              <ProductCard key={`feat-${product.id}`} product={product} compact />
            ))}
          </div>
        </section>
      )}

      <div className="container products-section">
        <div className="products-header">
          <div>
            <h2>Premium Devices Collection</h2>
            <p className="section-subtitle">
              Browse authentic smartphones from Apple, Samsung, Xiaomi, OnePlus, and more.
            </p>
          </div>
        </div>

        <aside className="catalog-toolbar" aria-label="Filter products">
          <div className="toolbar-grid">
            <div className="filter-field filter-field--search">
              <label htmlFor="catalog-search" className="filter-label">
                Search
              </label>
              <input
                id="catalog-search"
                type="search"
                className="filter-input"
                placeholder="iPhone, Samsung, Snapdragon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-field filter-field--brand">
              <label htmlFor="catalog-brand" className="filter-label">
                Brand
              </label>
              <select
                id="catalog-brand"
                className="filter-select"
                value={selectedBrand || ''}
                onChange={(e) =>
                  setSelectedBrand(e.target.value ? parseInt(e.target.value, 10) : null)
                }
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field filter-field--price">
              <label htmlFor="catalog-price" className="filter-label">
                Max price <span className="filter-value">{formatPeso(priceRange[1], { maximumFractionDigits: 0 })}</span>
              </label>
              <input
                id="catalog-price"
                type="range"
                min={MIN_PRODUCT_PRICE}
                max={MAX_CATALOG_PRICE}
                step="1000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([MIN_PRODUCT_PRICE, parseInt(e.target.value, 10)])
                }
                className="price-slider"
                aria-valuemin={MIN_PRODUCT_PRICE}
                aria-valuemax={MAX_CATALOG_PRICE}
                aria-valuenow={priceRange[1]}
              />
            </div>

            <div className="filter-field filter-field--sort">
              <label htmlFor="catalog-sort" className="filter-label">
                Sort by
              </label>
              <select
                id="catalog-sort"
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured First</option>
                <option value="name">Name (A–Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Most in Stock</option>
              </select>
            </div>
          </div>
          <p className="toolbar-results">
            Showing <strong>{sortedProducts.length}</strong> products
          </p>
        </aside>

        <div id="products" className="grid grid-products">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      <Newsletter onSubscribe={handleNewsletter} />
    </div>
  );
}
