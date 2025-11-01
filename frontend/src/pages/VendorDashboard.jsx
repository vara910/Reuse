import { useState, useEffect } from 'react';
import { vendorAPI, categoriesAPI } from '../services/api';
import { Package, DollarSign, TrendingUp, ShoppingCart, ImagePlus } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { name: 'Groceries', description: 'Daily grocery items' },
  { name: 'Dairy Products', description: 'Milk, cheese, yogurt, etc.' },
  { name: 'Bakery', description: 'Bread, cakes, pastries' },
  { name: 'Fruits & Vegetables', description: 'Fresh produce' },
  { name: 'Beverages', description: 'Drinks and juices' },
  { name: 'Snacks', description: 'Chips, cookies, etc.' },
  { name: 'Personal Care', description: 'Toiletries and hygiene products' },
  { name: 'Household', description: 'Cleaning supplies and essentials' },
];

function VendorDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    original_price: '',
    discounted_price: '',
    stock_quantity: '',
    expiry_date: '',
    brand: '',
    unit: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, productsRes, catsRes] = await Promise.all([
        vendorAPI.getDashboard(),
        vendorAPI.getProducts(),
        categoriesAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data.products);
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(prev => ({ ...prev, image: files?.[0] || null }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      name: '', category_id: '', original_price: '', discounted_price: '', stock_quantity: '',
      expiry_date: '', brand: '', unit: '', description: '', image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!form.category_id) {
        setError('Please select a category');
        setSubmitting(false);
        return;
      }
      let payload;
      let config = undefined;
      if (form.image) {
        payload = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (k === 'image' && v) payload.append('image', v);
          else if (v !== '' && v !== null) payload.append(k, v);
        });
        // Ensure correct content-type for multipart
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      } else {
        payload = {
          name: form.name,
          category_id: Number(form.category_id),
          original_price: Number(form.original_price),
          discounted_price: Number(form.discounted_price),
          stock_quantity: Number(form.stock_quantity),
          expiry_date: form.expiry_date,
          brand: form.brand || undefined,
          unit: form.unit || undefined,
          description: form.description || undefined,
        };
      }
      await vendorAPI.createProduct(payload, config);
      setSuccess('Product created successfully');
      resetForm();
      // Refresh list and stats
      const [productsRes, statsRes] = await Promise.all([
        vendorAPI.getProducts(),
        vendorAPI.getDashboard(),
      ]);
      setProducts(productsRes.data.products);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setSubmitting(false);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>Vendor Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <Package size={32} style={{marginBottom: '0.5rem'}} />
          <div className="stat-value">{stats?.total_products || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={32} style={{marginBottom: '0.5rem'}} />
          <div className="stat-value">{stats?.active_products || 0}</div>
          <div className="stat-label">Active Products</div>
        </div>
        <div className="stat-card">
          <ShoppingCart size={32} style={{marginBottom: '0.5rem'}} />
          <div className="stat-value">{stats?.total_sold || 0}</div>
          <div className="stat-label">Items Sold</div>
        </div>
        <div className="stat-card">
          <DollarSign size={32} style={{marginBottom: '0.5rem'}} />
          <div className="stat-value">₹{stats?.total_revenue || 0}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      <div className="card" style={{marginTop: '2rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <h2 style={{margin:0}}>Add New Product</h2>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(s => !s)}>
              {showAddCategory ? 'Close' : 'Add Category'}
            </button>
            <button type="button" className="btn btn-primary" disabled={catSubmitting} onClick={async () => {
              try {
                setCatSubmitting(true);
for (const c of DEFAULT_CATEGORIES) {
try { await categoriesAPI.create(c); } catch { console.debug('Category exists'); }
                }
                const catsRes = await categoriesAPI.getAll();
                setCategories(catsRes.data);
              } catch {
                alert('Failed to add default categories');
              } finally {
                setCatSubmitting(false);
              }
            }}>
              {catSubmitting ? 'Adding…' : 'Add Default Categories'}
            </button>
          </div>
        </div>
        {showAddCategory && (
          <div className="card" style={{background:'#f8f9fa', marginBottom:'1rem'}}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await categoriesAPI.create(catForm);
                const catsRes = await categoriesAPI.getAll();
                setCategories(catsRes.data);
                setCatForm({ name: '', description: '' });
                setShowAddCategory(false);
              } catch (err) {
                alert(err.response?.data?.error || 'Failed to add category');
              }
            }} style={{display:'flex', gap:'0.5rem', alignItems:'flex-end'}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Category Name</label>
                <input className="form-input" value={catForm.name} onChange={(e)=>setCatForm({...catForm, name: e.target.value})} required />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Description (optional)</label>
                <input className="form-input" value={catForm.description} onChange={(e)=>setCatForm({...catForm, description: e.target.value})} />
              </div>
              <button className="btn btn-primary" type="submit">Save</button>
            </form>
          </div>
        )}
        {error && <div className="form-error" style={{background:'#fee', padding:'0.75rem', borderRadius:4, marginBottom:'1rem'}}>{error}</div>}
        {success && <div className="form-success" style={{background:'#e8f8f5', padding:'0.75rem', borderRadius:4, marginBottom:'1rem'}}>{success}</div>}
        <form onSubmit={handleSubmit} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input name="name" className="form-input" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category_id" className="form-input" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Original Price (₹)</label>
            <input name="original_price" type="number" min="0" step="0.01" className="form-input" value={form.original_price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Discounted Price (₹)</label>
            <input name="discounted_price" type="number" min="0" step="0.01" className="form-input" value={form.discounted_price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Quantity</label>
            <input name="stock_quantity" type="number" min="0" step="1" className="form-input" value={form.stock_quantity} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input name="expiry_date" type="date" className="form-input" value={form.expiry_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input name="brand" className="form-input" value={form.brand} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <input name="unit" className="form-input" value={form.unit} onChange={handleChange} placeholder="kg, liters, pcs" />
          </div>
          <div className="form-group" style={{gridColumn:'1 / -1'}}>
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Image (optional)</label>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
              <input name="image" type="file" accept="image/*" onChange={handleChange} />
              <ImagePlus size={18} />
            </div>
          </div>
          <div style={{gridColumn:'1 / -1', display:'flex', justifyContent:'flex-end'}}>
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{marginTop: '2rem'}}>
        <h2 style={{marginBottom: '1rem'}}>My Products</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>₹{product.discounted_price}</td>
                <td>{product.stock_quantity}</td>
                <td>{product.expiry_date}</td>
                <td><span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VendorDashboard;
