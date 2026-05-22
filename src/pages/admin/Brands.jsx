import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useStore } from '../../store/store';
import { brandAPI } from '../../api/client';
import toast from 'react-hot-toast';

export default function AdminBrands() {
  const { brands, setBrands } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');

  const refreshBrands = async () => {
    const res = await brandAPI.getAll();
    setBrands(res.data.data || []);
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      await brandAPI.create({ name });
      await refreshBrands();
      toast.success('Brand added successfully.');
      setName('');
      setShowForm(false);
    } catch (error) {
      toast.error('Could not add brand. Please try again.');
    }
  };

  const handleDeleteBrand = async (id, brandName) => {
    if (!window.confirm(`Delete brand "${brandName}"?`)) return;
    try {
      await brandAPI.delete(id);
      await refreshBrands();
      toast.success('Brand deleted successfully.');
    } catch (error) {
      toast.error('Could not delete brand. Please try again.');
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Brands</h1>
          <p>{brands.length} manufacturers</p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add brand'}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="admin-form">
          <h3>New brand</h3>
          <form onSubmit={handleAddBrand}>
            <div className="form-group">
              <label>Brand name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save brand
            </button>
          </form>
        </div>
      )}

      <div className="brands-grid">
        {brands.map((brand) => (
          <div key={brand.id} className="brand-card dashboard-card">
            <h3>{brand.name}</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDeleteBrand(brand.id, brand.name)}
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
