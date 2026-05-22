import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiUserPlus } from 'react-icons/fi';
import { staffAPI } from '../../api/client';
import RequireAdmin from '../../components/routes/RequireAdmin';
import { roleLabel } from '../../utils/roles';
import { format } from 'date-fns';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', username: '', password: '' });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll();
      setStaff(res.data.data || []);
    } catch (err) {
      toast.error('Unable to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.create(form);
      toast.success('Staff member added successfully!');
      setForm({ full_name: '', username: '', password: '' });
      setShowForm(false);
      loadStaff();
    } catch (err) {
      console.error('[Staff] create error:', err);
      const msg = err?.message || err?.response?.data?.error || 'Could not add staff member. Please try again.';
      toast.error(msg);
    }
  };

  const handleRemove = async (member) => {
    if (member.role === 'admin') {
      toast.error('Admin accounts cannot be removed.');
      return;
    }
    if (!window.confirm(`Remove staff access for ${member.email}?`)) return;
    try {
      await staffAPI.remove(member.id);
      toast.success('Staff member removed successfully.');
      loadStaff();
    } catch (err) {
      toast.error('Could not remove staff member. Please try again.');
    }
  };

  return (
    <RequireAdmin>
      <div className="admin-page">
        <header className="admin-page-header">
          <div>
            <h1>Staff</h1>
            <p>Create accounts for team members who manage products and orders</p>
          </div>
          <div className="admin-page-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <FiUserPlus /> {showForm ? 'Cancel' : 'Add staff'}
            </button>
          </div>
        </header>

        {showForm && (
          <div className="admin-form">
            <h3>New staff member</h3>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="staff-name">Full name</label>
                  <input
                    id="staff-name"
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    maxLength={120}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="staff-username">Username</label>
                  <input
                    id="staff-username"
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    autoComplete="off"
                    placeholder="e.g. jens"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="staff-password">Temporary password</label>
                <input
                  id="staff-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={2}
                  placeholder="Minimum 2 characters"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create staff account
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="admin-loading">Loading team…</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>{member.full_name || '—'}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`role-pill ${member.role}`}>{roleLabel(member.role)}</span>
                    </td>
                    <td>
                      {member.created_at
                        ? format(new Date(member.created_at), 'MMM d, yyyy')
                        : '—'}
                    </td>
                    <td className="actions">
                      {member.role === 'staff' && (
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          onClick={() => handleRemove(member)}
                          title="Remove staff access"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}
