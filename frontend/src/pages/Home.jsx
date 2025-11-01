import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { TrendingUp, Clock, Percent } from 'lucide-react';

function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          productsAPI.getFeatured(),
          productsAPI.getTrending(),
        ]);
        setFeatured(featuredRes.data);
        setTrending(trendingRes.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        borderRadius: '8px',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>
          Save Money, Reduce Waste
        </h1>
        <p style={{fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9}}>
          Buy quality products near expiry at amazing discounts
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}
          style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>
          Shop Now
        </button>
      </div>

      {/* Features */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
        <div className="card" style={{textAlign: 'center'}}>
          <Percent size={48} color="#3498db" style={{margin: '0 auto 1rem'}} />
          <h3>Up to 70% Off</h3>
          <p>Huge discounts on surplus and near-expiry products</p>
        </div>
        <div className="card" style={{textAlign: 'center'}}>
          <Clock size={48} color="#e67e22" style={{margin: '0 auto 1rem'}} />
          <h3>Fresh Quality</h3>
          <p>Products are safe to consume, just near expiry date</p>
        </div>
        <div className="card" style={{textAlign: 'center'}}>
          <TrendingUp size={48} color="#27ae60" style={{margin: '0 auto 1rem'}} />
          <h3>Help the Planet</h3>
          <p>Reduce food waste and support sustainability</p>
        </div>
      </div>

      {/* Featured Products */}
      <section>
        <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Expiring Soon - Best Deals</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="products-grid">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Products */}
      <section style={{marginTop: '3rem'}}>
        <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Trending Products</h2>
        <div className="products-grid">
          {trending.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
