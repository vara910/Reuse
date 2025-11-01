import { Link } from 'react-router-dom';
import { ShoppingCart, User, Package } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { useEffect } from 'react';
import { cartAPI } from '../services/api';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cartCount, setCart } = useCartStore();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  useEffect(() => {
    const syncCart = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await cartAPI.get();
        const count = res.data.items?.length || 0;
        const total = res.data.total || 0;
        setCart(count, total);
      } catch {
        console.debug('Failed to sync cart count');
      }
    };
    syncCart();
  }, [isAuthenticated, setCart]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🛒 Surplus Market
        </Link>
        
        <ul className="navbar-nav">
          <li><Link to="/" className="navbar-link">Home</Link></li>
          <li><Link to="/products" className="navbar-link">Products</Link></li>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'vendor' && (
                <li><Link to="/vendor" className="navbar-link">
                  <Package size={20} style={{display: 'inline', marginRight: '5px'}} />
                  Dashboard
                </Link></li>
              )}
              <li><Link to="/orders" className="navbar-link">Orders</Link></li>
              <li><Link to="/cart" className="navbar-link">
                <ShoppingCart size={20} style={{display: 'inline'}} />
                {cartCount > 0 && <span style={{marginLeft: '5px'}}>({cartCount})</span>}
              </Link></li>
              <li><Link to="/profile" className="navbar-link">
                <User size={20} style={{display: 'inline'}} /> Profile
              </Link></li>
              <li><button onClick={handleLogout} className="btn btn-secondary">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn-primary">Login</Link></li>
              <li><Link to="/register" className="btn btn-success">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
