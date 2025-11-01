import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'customer',
    business_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.register(formData);
      const { user, access_token } = response.data;
      setAuth(user, access_token);
      localStorage.setItem('access_token', access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Register</h2>
      {error && <div className="form-error" style={{background: '#fee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem'}}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input type="text" className="form-input" value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input type="text" className="form-input" value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <input type={showPassword ? 'text' : 'password'} className="form-input" value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{flex:1}} />
            <button type="button" className="btn btn-secondary" onClick={() => setShowPassword(s => !s)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="tel" className="form-input" value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">I am a:</label>
          <select className="form-input" value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        {formData.role === 'vendor' && (
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input type="text" className="form-input" value={formData.business_name}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})} />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{width: '100%'}}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="auth-link" style={{marginTop: '1rem', textAlign: 'center'}}>
        Already have an account? <Link to="/login" style={{color: '#3498db'}}>Login here</Link>
      </div>
    </div>
  );
}

export default Register;
