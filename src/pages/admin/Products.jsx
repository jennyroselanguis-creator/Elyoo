import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiImage } from 'react-icons/fi';
import { useStore } from '../../store/store';
import { productAPI } from '../../api/client';
import { formatPeso } from '../../utils/currency';
import { getProductImageSrc } from '../../utils/productImage';
import { readProductImageFile } from '../../utils/imageUpload';
import toast from 'react-hot-toast';
import { MIN_PRODUCT_PRICE } from '../../data/seed';

const emptyForm = {
  name: '',
  model: '',
  brand_id: '',
  price: '',
  stock: '',
  specs: '',
  image: '',
  featured: false,
};

export default function AdminProducts() {
  const { products, brands, setProducts } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const resetForm = () => {
    setFormData(emptyForm);
    setImagePreview('');
    setEditingProductId(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await readProductImageFile(file);
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      toast.success('Image uploaded successfully.');
    } catch (err) {
      toast.error('Invalid image file.');
      e.target.value = '';
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.image && !imagePreview) {
      toast.error('Please add a product photo.');
      return;
    }
    try {
      const res = await productAPI.create({
        ...formData,
        image: formData.image || imagePreview,
      });
      const refreshed = await productAPI.getAll();
      setProducts(refreshed.data.data || []);
      const saved = res.data.data;
      if (saved?._savedLocally) {
        toast.success('Product saved locally.');
      } else if (saved?.id) {
        toast.success('Product saved successfully.');
      } else {
        toast.success('Product added successfully.');
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      toast.error('Could not add product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      const refreshed = await productAPI.getAll();
      setProducts(refreshed.data.data || []);
      toast.success('Product deleted.');
    } catch (error) {
      toast.error('Could not delete product. Please try again.');
    }
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name || '',
      model: product.model || '',
      brand_id: product.brand_id || '',
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      specs: product.specs || product.description || '',
      image: product.image || '',
      featured: Boolean(product.featured),
    });
    setEditingProductId(product.id);
    setImagePreview(product.image || '');
    setShowForm(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await productAPI.update(editingProductId, {
        ...formData,
        image: formData.image || imagePreview,
      });
      const refreshed = await productAPI.getAll();
      setProducts(refreshed.data.data || []);
      toast.success('Product updated successfully.');
      resetForm();
      setShowForm(false);
    } catch (error) {
      toast.error('Could not update product. Please try again.');
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} devices in catalog</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }}
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Add product'}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="admin-form">
          <h3>{editingProductId ? 'Edit product' : 'Add new product'}</h3>
          <form onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}>
            <div className="product-image-upload">
              <label className="upload-label">
                <FiImage aria-hidden="true" /> Product photo <span className="required-mark">*</span>
              </label>
              <div className="upload-row">
                <div className="upload-preview">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" />
                  ) : (
                    <span className="upload-placeholder">No image selected</span>
                  )}
                </div>
                <div className="upload-controls">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                  />
                  <p className="upload-hint">JPG, PNG, WebP or GIF · max 2 MB</p>
                  {imagePreview && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setImagePreview('');
                        setFormData((prev) => ({ ...prev, image: '' }));
                      }}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price (₱)</label>
                <div className="input-with-symbol">
                  <span className="input-symbol" aria-hidden="true">
                    ₱
                  </span>
                  <input
                    type="number"
                    min={MIN_PRODUCT_PRICE}
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <small className="form-hint">Minimum ₱{MIN_PRODUCT_PRICE.toLocaleString()}</small>
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description / specs</label>
              <textarea
                rows={3}
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              />
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              Featured on homepage
            </label>
            <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
              Save product
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={getProductImageSrc(product.image)}
                    alt=""
                    className="admin-product-thumb"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/iphone/iphone15.jpg';
                    }}
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.brand_name}</td>
                <td>{product.model}</td>
                <td>{formatPeso(product.price)}</td>
                <td>{product.stock}</td>
                <td className="actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleEditClick(product)}
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
