import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

function Checkout() {
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
    payment_method: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ordersAPI.create(formData);
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '0 auto'}}>
      <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>Checkout</h1>
      <form onSubmit={handleSubmit} className="card">
        <h3 style={{marginBottom: '1rem'}}>Shipping Address</h3>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={formData.shipping_name}
            onChange={(e) => setFormData({...formData, shipping_name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="tel" className="form-input" value={formData.shipping_phone}
            onChange={(e) => setFormData({...formData, shipping_phone: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Address Line 1</label>
          <input type="text" className="form-input" value={formData.shipping_address_line1}
            onChange={(e) => setFormData({...formData, shipping_address_line1: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input type="text" className="form-input" value={formData.shipping_city}
            onChange={(e) => setFormData({...formData, shipping_city: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">State</label>
          <input type="text" className="form-input" value={formData.shipping_state}
            onChange={(e) => setFormData({...formData, shipping_state: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input type="text" className="form-input" value={formData.shipping_pincode}
            onChange={(e) => setFormData({...formData, shipping_pincode: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select className="form-input" value={formData.payment_method}
            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
            <option value="cod">Cash on Delivery</option>
            <option value="card">Credit/Debit Card</option>
            <option value="upi">UPI</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success" disabled={loading} style={{width: '100%', padding: '1rem'}}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
