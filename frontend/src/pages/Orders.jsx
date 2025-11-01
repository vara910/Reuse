import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      shipped: 'badge-success',
      delivered: 'badge-success',
      cancelled: 'badge-danger'
    };
    return statusMap[status] || 'badge-warning';
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
          <p style={{color: '#95a5a6'}}>No orders yet</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>₹{order.final_amount}</td>
                  <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;
