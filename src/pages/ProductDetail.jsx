import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI } from '../api/client';
import { useStore } from '../store/store';
import { getProductImageSrc, PRODUCT_IMAGE_PLACEHOLDER } from '../utils/productImage';
import { formatPeso } from '../utils/currency';
import '../styles/product-detail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgSrc, setImgSrc] = useState(PRODUCT_IMAGE_PLACEHOLDER);
  const { addToCart, products } = useStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const cached = products.find((p) => String(p.id) === String(id));
      if (cached) {
        setProduct(cached);
        setLoading(false);
        return;
      }
      try {
        const res = await productAPI.getById(id);
        setProduct(res.data.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, products]);

  useEffect(() => {
    if (product?.image) setImgSrc(getProductImageSrc(product.image));
  }, [product]);

  if (loading) {
    return (
      <div className="container product-detail-loading">
        <div className="skeleton-loader" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container empty-state-page">
        <h2>Product not found</h2>
        <Link to="/" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const specs = product.specs || product.description || 'Premium authentic device';

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Sorry, this item is out of stock.');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  return (
    <div className="container product-detail-page">
      <Link to="/" className="back-link">
        <FiArrowLeft /> Back to catalog
      </Link>

      <div className="product-detail-grid">
        <div className="detail-image-panel">
          <img
            src={imgSrc}
            alt={product.name}
            className="detail-product-image"
            onError={() => setImgSrc(PRODUCT_IMAGE_PLACEHOLDER)}
          />
          <span className="detail-brand-badge">{product.brand_name}</span>
          {product.featured && <span className="detail-featured-badge">Featured</span>}
        </div>

        <div className="detail-info-panel">
          <h1>{product.name}</h1>
          <p className="detail-model">Model: {product.model}</p>
          <p className="detail-specs">{specs}</p>

          <div className="detail-meta">
            <span className="detail-price">{formatPeso(product.price)}</span>
            <span className={`detail-stock ${product.stock > 0 ? 'in' : 'out'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="detail-actions">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="qty-input"
              />
              <button className="btn btn-primary btn-add-detail" onClick={handleAddToCart}>
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          )}

          <ul className="detail-trust">
            <li>✓ 100% authentic devices</li>
            <li>✓ Secure checkout</li>
            <li>✓ Fast local support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
