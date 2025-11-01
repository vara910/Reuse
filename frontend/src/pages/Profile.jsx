import { useState } from 'react';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      alert('Profile updated successfully!');
    } catch {
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '0 auto'}}>
      <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>My Profile</h1>
      <div className="card">
        <div style={{marginBottom: '2rem'}}>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" className="form-input" value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-input" value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
