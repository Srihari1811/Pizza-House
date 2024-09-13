import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import './MyOrders.css'; // Import custom CSS for additional styling

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reverseOrder, setReverseOrder] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/getOrders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();

        // Load saved statuses from local storage
        const savedStatuses = JSON.parse(localStorage.getItem('orderStatuses')) || {};

        // Update orders with the saved statuses
        const updatedOrders = data.map((order) => ({
          ...order,
          status: savedStatuses[order._id] || order.status,
        }));

        // Sort orders with "Delivered" at the bottom
        updatedOrders.sort((a, b) => (a.status === 'Delivered' ? 1 : -1));

        setOrders(updatedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = (orderId) => {
    const updatedOrders = orders.map((order) => {
      if (order._id === orderId) {
        if (order.status === 'Delivered') return order;
        const newStatus = 'Delivered';

        // Save updated status to local storage
        const savedStatuses = JSON.parse(localStorage.getItem('orderStatuses')) || {};
        savedStatuses[orderId] = newStatus;
        localStorage.setItem('orderStatuses', JSON.stringify(savedStatuses));

        return { ...order, status: newStatus };
      }
      return order;
    });

    // Sort orders with "Delivered" at the bottom
    updatedOrders.sort((a, b) => (a.status === 'Delivered' ? 1 : -1));

    setOrders(updatedOrders);
  };

  const toggleReverseOrder = () => {
    setReverseOrder(!reverseOrder);
  };

  const displayedOrders = reverseOrder ? [...orders].reverse() : orders;

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-danger">Error: {error}</p>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/admin" className="btn btn-secondary custom-back-btn">
          <i className="fa fa-arrow-left"></i> 
        </Link>
        <h4 className="custom-title text-center">My Orders</h4>
        <button
          className="btn btn-info" style={{width:'40px'}}
          onClick={toggleReverseOrder}
          aria-label={reverseOrder ? 'Normal Order' : 'Reverse Order'}
        >
          <i className={`fa ${reverseOrder ? 'fa-arrow-down' : 'fa-arrow-up'}`} />
        </button>
      </div>

      {displayedOrders.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover shadow-sm" style={{textAlign:"center", verticalalign: "middle"}}> 
            <thead className="thead-dark" >
              <tr>
                <th>S.No</th>
                <th>Order ID</th>
                <th style={{width:'300px'}}> Name</th>
                <th style={{width:'300px'}}>Mobile</th>
                <th style={{width:'300px'}}>Table Number</th>
                <th style={{width:'800px'}}>Cart Items</th>
                <th style={{width:'300px'}}>Date & Time</th>
                <th style={{width:'300px'}}>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order, index) => (
                <tr key={order._id}>
                  <td>{reverseOrder ? displayedOrders.length - index : index + 1}</td>
                  <td>{order._id}</td>
                  <td>{order.name}</td>
                  <td>{order.mobile}</td>
                  <td>{order.tableNumber}</td>
                  <td>
                    <ul className="list-unstyled" style={{fontSize:'20px',fontWeight:""}}>
                      {order.products.map((item) => (
                        <li key={item._id}>
                          {item.name} - ₹{item.price} x {item.quantity || 1}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    {order.status === 'Delivered' ? (
                      <span className="badge bg-success">Delivered</span>
                    ) : (
                      <button
                        className="btn btn-warning"
                        onClick={() => handleStatusChange(order._id)}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center">No orders found.</p>
      )}
    </div>
  );
}

export default MyOrders;
