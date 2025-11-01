import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { Trash2 } from 'lucide-react';

function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await cartAPI.remove(id);
      fetchCart();
    } catch {
      alert('Error removing item');
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div>
      <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
          <p style={{color: '#95a5a6', marginBottom: '1rem'}}>Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Start Shopping</button>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
          <div className="card">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image" style={{background: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {item.product?.image_url ? <img src={item.product.image_url} alt={item.product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '📦'}
                </div>
                <div className="cart-item-info">
                  <h3>{item.product?.name}</h3>
                  <p style={{color: '#27ae60', fontWeight: 'bold'}}>₹{item.product?.discounted_price}</p>
                  <p style={{color: '#7f8c8d', fontSize: '0.9rem'}}>Quantity: {item.quantity}</p>
                </div>
                <div className="cart-item-actions">
                  <p style={{fontWeight: 'bold', fontSize: '1.2rem'}}>₹{item.subtotal}</p>
                  <button className="btn btn-danger" onClick={() => handleRemove(item.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div style={{marginTop: '1rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Subtotal:</span>
                  <span>₹{cart.total}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Shipping:</span>
                  <span>₹{cart.total > 500 ? 0 : 50}</span>
                </div>
                <hr style={{margin: '1rem 0'}} />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold'}}>
                  <span>Total:</span>
                  <span>₹{cart.total + (cart.total > 500 ? 0 : 50)}</span>
                </div>
              </div>
              <button className="btn btn-success" onClick={() => navigate('/checkout')} style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}}>Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
