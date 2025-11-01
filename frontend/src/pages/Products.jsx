import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    sort_by: 'created_at'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll(filters);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>All Products</h1>
      
      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <select className="form-input" value={filters.category_id}
            onChange={(e) => setFilters({...filters, category_id: e.target.value})}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select className="form-input" value={filters.sort_by}
            onChange={(e) => setFilters({...filters, sort_by: e.target.value})}>
            <option value="created_at">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="expiry">Expiring Soon</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length > 0 ? (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '3rem', color: '#95a5a6'}}>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}

export default Products;
