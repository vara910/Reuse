import { useNavigate } from 'react-router-dom';
import { Calendar, Package } from 'lucide-react';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const getExpiryColor = (days) => {
    if (days <= 3) return '#e74c3c';
    if (days <= 7) return '#e67e22';
    return '#f39c12';
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-image" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem'
      }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <Package size={80} color="#95a5a6" />
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-price">
          <span className="original-price">₹{product.original_price}</span>
          <span className="discounted-price">₹{product.discounted_price}</span>
          <span className="discount-badge">{Math.round(product.discount_percentage)}% OFF</span>
        </div>
        
        {product.days_to_expiry !== null && (
          <div className="expiry-info" style={{color: getExpiryColor(product.days_to_expiry)}}>
            <Calendar size={16} style={{display: 'inline', marginRight: '5px'}} />
            Expires in {product.days_to_expiry} days
          </div>
        )}
        
        <div style={{fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem'}}>
          {product.vendor_name} • Stock: {product.stock_quantity}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
