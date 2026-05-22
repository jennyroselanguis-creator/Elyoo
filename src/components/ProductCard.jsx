import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../store/store';
import { getProductImageSrc, PRODUCT_IMAGE_PLACEHOLDER } from '../utils/productImage';
import { formatPeso } from '../utils/currency';
import '../styles/product-card.css';

export default function ProductCard({ product, compact = false }) {
  const [quantity, setQuantity] = useState(1);
  const [imgSrc, setImgSrc] = useState(() => getProductImageSrc(product.image));
  const { addToCart } = useStore();

  useEffect(() => {
    setImgSrc(getProductImageSrc(product.image));
  }, [product.id, product.image]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (quantity > 0 && product.stock > 0) {
      addToCart(product, quantity);
      toast.success('Added to cart!');
      setQuantity(1);
    }
  };

  const handleImageError = () => {
    if (imgSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
      setImgSrc(PRODUCT_IMAGE_PLACEHOLDER);
    }
  };

  const stockStatus =
    product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'limited' : 'in-stock';
  const stockLabel =
    product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Limited' : 'In Stock';

  return (
    <article className={`product-card ${compact ? 'compact' : ''}`}>
      <Link to={`/product/${product.id}`} className="card-image-link">
        <div className="card-image-wrapper">
          <img
            src={imgSrc}
            alt=""
            className="product-image"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />

          <div className="card-overlay-badges">
            <div className="card-badges-row card-badges-top">
              <span className="card-badge">{product.brand_name}</span>
            </div>
            <div className="card-badges-row card-badges-bottom">
              <span className={`stock-badge stock-${stockStatus}`}>{stockLabel}</span>
              {product.featured && <span className="featured-pill">★ Featured</span>}
            </div>
          </div>
        </div>
      </Link>

      <div className="card-body">
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-model">Model: {product.model}</p>
        {!compact && (
          <div className="product-specs">
            <p>{(product.specs || product.description || '').slice(0, 80)}...</p>
          </div>
        )}
        <div className="price-section">
          <span className="product-price">{formatPeso(product.price)}</span>
        </div>
        {!compact && (
          <div className="add-to-cart-section">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="qty-input"
              disabled={product.stock === 0}
              aria-label={`Quantity for ${product.name}`}
            />
            <button
              type="button"
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        )}
        {compact && product.stock > 0 && (
          <button type="button" className="btn-add-cart btn-block" onClick={handleAddToCart}>
            Quick Add
          </button>
        )}
      </div>
    </article>
  );
}
