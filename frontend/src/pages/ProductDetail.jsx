import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../services/api';
import { ShoppingCart, Calendar, Package2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await cartAPI.add({ product_id: product.id, quantity: 1 });
      // Refresh cart badge
      try {
        const cartRes = await cartAPI.get();
        const count = cartRes.data.items?.length || 0;
        const total = cartRes.data.total || 0;
        setCart(count, total);
      } catch {
        console.debug('Failed to refresh cart after add');
      }
      alert('Added to cart!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="card" style={{maxWidth: '1000px', margin: '0 auto'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        <div style={{background: '#ecf0f1', borderRadius: '8px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {product.image_url ? <img src={product.image_url} alt={product.name} style={{maxWidth: '100%', maxHeight: '100%'}} /> : <Package2 size={100} color="#95a5a6" />}
        </div>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>{product.name}</h1>
          <div style={{marginBottom: '1rem'}}>
            <span style={{fontSize: '2rem', color: '#27ae60', fontWeight: 'bold'}}>₹{product.discounted_price}</span>
            <span style={{fontSize: '1.2rem', textDecoration: 'line-through', color: '#95a5a6', marginLeft: '1rem'}}>₹{product.original_price}</span>
            <span className="discount-badge" style={{marginLeft: '1rem'}}>{Math.round(product.discount_percentage)}% OFF</span>
          </div>
          <p style={{color: '#7f8c8d', marginBottom: '1rem'}}>{product.description}</p>
          <div style={{marginBottom: '1rem'}}>
            <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
            <p><strong>Vendor:</strong> {product.vendor_name}</p>
            <p><strong>Stock:</strong> {product.stock_quantity} units</p>
            <p style={{color: '#e67e22'}}><Calendar size={16} style={{display: 'inline', marginRight: '5px'}} /> <strong>Expires in {product.days_to_expiry} days</strong></p>
          </div>
          <button className="btn btn-success" onClick={handleAddToCart} disabled={addingToCart || product.stock_quantity === 0} style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}>
            <ShoppingCart size={20} style={{display: 'inline', marginRight: '8px'}} />
            {addingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
